import { formatDate } from './helpers';
import { reloadDataBase } from './helpers';
import { REVIEW_NONE } from './lang';

let Handlebars = require("handlebars");

class Review {
    // методы класса
    constructor() {}

    /* вызов формы */
    showForm() {
        let [reviewForm, reviewList] = [document.querySelector('.reviewForm'), document.querySelector('.reviewList')];
        reviewList.innerHTML = REVIEW_NONE;
        reviewForm.classList.toggle('active');
    }

    /* сформировать объект отзыва из формы и добавить к другим отзывам */
    getReview(coords) {
        let name = document.querySelector('.addReview__input[name="name"]'); // поле Имя
        let place = document.querySelector('.addReview__input[name="place"]'); // поле Место
        let message = document.querySelector('.addReview__textarea'); // поле Комментарий
        let adress = document.querySelector('.reviewForm__adress'); // адрес
        let date = new Date();
        let item = {
            'name': name.value,
            'place': place.value,
            'message': message.value,
            'data': formatDate(date),
            'coords': coords,
            'adress': adress.textContent,
            'id': date.getTime(),
        };

        reloadDataBase(item);
        [name.value, place.value, message.value] = ['', '', ''];
        return item;
    }

    /* показать отзывы, заполненные по координатам. метод выбирает либо отзывы по одному объекту, либо сгруппированные кластером*/
    showRewiew(coords, balloons, data) {

        let reviewList = document.querySelector('.reviewList');
        reviewList.innerHTML = '';
        let filtered = [];
        let filteredBalloons = [];

        let templateReview = Handlebars.compile("<div class='reviewItem'><div class='reviewItem__header'><div class='reviewItem__reviewAutor'>{{name}}</div><div class='reviewItem__reviewPlace'>{{place}}</div><div class='reviewItem__reviewData'>{{date}}</div></div><div class='reviewItem__content'>{{message}}</div></div>");

        if (balloons.length > 0) {
            for (let i = 0; i < balloons.length; i++) {
                let r = data.filter(item => item.coords[0] == balloons[i][0] && item.coords[1] == balloons[i][1]);
                for (let j = 0; j < r.length; j++) {
                    filteredBalloons.push(r[i]);
                }
            }

            filtered = filteredBalloons.sort(function(a, b) { return a.id < b.id ? -1 : 1; }).reduce(function(filteredBalloons, el) {
                if (!filteredBalloons.length || filteredBalloons[filteredBalloons.length - 1].id != el.id) {
                    filteredBalloons.push(el);
                }
                return filteredBalloons;
            }, []);
            coords = balloons[0];
            balloons = [];
        } else {
            filtered = data.filter(item => item.coords[0] == coords[0] && item.coords[1] == coords[1]);
        }

        for (let i = 0; i < filtered.length; i++) {
            let item = templateReview({ name: filtered[i].name, place: filtered[i].place, date: filtered[i].data, message: filtered[i].message });
            reviewList.innerHTML = reviewList.innerHTML + item;
        }
    }

}

export {
    Review
}