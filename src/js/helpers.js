/* библиотека функций-хэлперов */

/* получение текущей даты в формате */
function formatDate(date) {
    let now = [date.getDate(), date.getMonth() + 1, date.getFullYear() % 100, date.getHours(), date.getMinutes(), date.getSeconds()];

    for (let i = 0; i < now.length; i++) {
        if (now[i] < 10) {
            now[i] = '0' + now[i];
        }
    }

    return now[0] + '.' + now[1] + '.' + now[2] + ' ' + now[3] + ':' + now[4] + ':' + now[5];
}

/* загрузить базу точек */
function loadDataBase(data) {
    if (localStorage.getItem('item')) {
        data = JSON.parse(localStorage.getItem('item'));
        console.log(data);
    }
    return data;
}

/* обновить либо пополнить базу точек */
function reloadDataBase(item) {
    let data = [];
    if (localStorage.getItem('item') != null) {
        data = JSON.parse(localStorage.getItem('item'));
    }
    data.push(item);
    localStorage.setItem('item', JSON.stringify(data));
}

export {
    formatDate,
    loadDataBase,
    reloadDataBase
}