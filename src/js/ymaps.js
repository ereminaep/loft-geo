import { formatDate } from './helpers';
import { loadDataBase } from './helpers';
import { Review } from './review';
import './lang';

let Handlebars = require("handlebars");

let review = new Review();

let coords; // координаты клика по точке
let balloons = []; // координаты активного балуна
let map = document.querySelector('#map'); // карта
var data = []; // массив со всеми точками карты, может обновляться из localStorage
let close = document.querySelector('.reviewForm__close'); // кнопка закрытия формы
let add = document.querySelector('.addReview__button'); // кнопка добавления отзыва
let go = document.querySelectorAll('.goform'); //ссылка с балуна

/*параметры карты*/
let centerMap = [55.751574, 37.573856]; //центр карты
let zoomMap = 12; //зум карты
let colorMarkerMap = '#7e1f96';

/*параметры кластера*/
let preset = 'islands#invertedVioletClusterIcons';
let clusterBalloonContentLayout = 'cluster#balloonCarousel';

/* шаблон содержимого балуна */
let balloonContent = Handlebars.compile("<a href='#' data-item='{{coords}}' class='goform'>{{adress}}</a><br/>{{message}}");

function mapInit() {
    ymaps.ready(function() {

        /* загружаем данные отзывов из LocalStorage */
        data = loadDataBase(data);

        /* загружаем карту */
        var myMap = new ymaps.Map('map', {
                center: centerMap,
                zoom: zoomMap,
            }, {
                searchControlProvider: 'yandex#search',
                yandexMapDisablePoiInteractivity: true,
            }),
            clusterer = new ymaps.Clusterer({
                preset: preset,
                clusterBalloonContentLayout: clusterBalloonContentLayout,
                groupByCoordinates: false,
                clusterHideIconOnBalloonOpen: false,
                geoObjectHideIconOnBalloonOpen: false
            });

        /* добавление на карту точку с балуном */
        function addPount(myMap, coords, item) {
            let placemarkt = new ymaps.Placemark(coords, {
                balloonContentHeader: item.place,
                balloonContentBody: balloonContent({ coords: coords, adress: item.adress, message: item.message }),
                balloonContentFooter: item.data,
                clusterCaption: item.name
            }, {
                preset: 'islands#violetIcon',
            });

            myMap.geoObjects.add(placemarkt);
            clusterer.add(placemarkt);
        }

        /* события */
        close.onclick = review.showForm; // закрыть форму при клике на крест

        /* добавить отзыв при клике на кнопку добавления */
        add.onclick = function(e) {
            e.preventDefault;
            let item = review.getReview(coords);
            review.showRewiew(coords, balloons, data);
            addPount(myMap, coords, item);

        };

        /* отслеживаем клик по адресу из балуна */
        map.onclick = function(e) {
            if (e.target.className == 'goform') {
                e.preventDefault;
                myMap.balloon.close();
                review.showForm();
                review.showRewiew(e.target.dataset.item.split(','), balloons, data);
            }
        };

        /* показываем форму при клике на карту */
        myMap.events.add('click', function(e) {
            coords = e.get('coords');
            ymaps.geocode(coords).then(function(res) {
                var first = res.geoObjects.get(0),
                    name = first.properties.get('name');
                let adressBlock = document.querySelector('.reviewForm__adress');
                adressBlock.textContent = name;
            }).then(review.showForm());
        });

        clusterer.events
            .add(['click'], function(e) {
                let target = e.get('target'),
                    type = e.get('type');
                balloons = [];
                /* в случае клика по кластеру, показываем балун и вычисляем отзывы, которые соответствуют группе, иначе открываем форму */
                if (typeof target.getGeoObjects != 'undefined') {
                    for (let i = 0; i < target.getGeoObjects().length; i++) {
                        balloons.push(target.getGeoObjects()[i].geometry.getBounds()[0]);
                    }
                } else {
                    review.showForm();
                    coords = target.geometry.getBounds()[0];
                    review.showRewiew(coords, balloons, data);
                    target.options.set('hasBalloon', false);
                }
            });

        let getPointData = function(index) {
                return {
                    balloonContentHeader: data[index].place,
                    balloonContentBody: balloonContent({ coords: data[index].coords, adress: data[index].adress, message: data[index].message }),
                    balloonContentFooter: data[index].data,
                    clusterCaption: data[index].name
                };
            },

            getPointOptions = function() {
                return {
                    preset: 'islands#violetIcon'
                };
            };

        let points = [];

        for (let i = 0; i < data.length; i++) {

            let newIco = new ymaps.Placemark(data[i].coords, {}, {
                iconColor: colorMarkerMap
            });

            newIco.events.add('click', function(e) {
                e.preventDefault;
                review.showForm();
            })

            points.push(data[i].coords);
        }

        let geoObjects = [];

        for (let i = 0, len = points.length; i < len; i++) {
            geoObjects[i] = new ymaps.Placemark(points[i], getPointData(i), getPointOptions());
        }
        clusterer.add(geoObjects);
        clusterer.options.set({
            gridSize: 80,
            clusterDisableClickZoom: true
        });
        myMap.geoObjects.add(clusterer);
        myMap.setBounds(clusterer.getBounds(), {
            checkZoomRange: true
        });
    });
}

export {
    mapInit
}