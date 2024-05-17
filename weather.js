// get cities Array from local storage if exists or set to an empty array
let cityList = JSON.parse(localStorage.getItem("cities")) || [];

// function to add past searches as list items to the <ul> with id searchList
function pastSearches() {
    for (city of cityList) {
        const item = `
        <li> <button class="btn btn-primary past-search m-1" id="${city}">${city}</button></li>
        `
        $('#searchList').append(item)
    }

}

// function to get the current weather from the api and render it
async function getCurrentWeather(url) {
    const response = await fetch(url);
    const data = await response.json();
    renderCurrentWeather(data)

    return data;
}

// function to render the current weather conditions to the right side of the page when a search is sent
function renderCurrentWeather(data) {
    $('.right').empty()
    const city = data.name
    const temp = data.main.temp
    const wind = data.wind.speed
    const humidity = data.main.humidity
    const icon = data.weather[0].icon
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    $('.right').prepend(`
<div class="border border-dark">
<h1>${city} (${month}/${day}/${year})</h1>
<p>${temp} °F</p>
<p>${wind} MPH</p>
<p>${humidity}% Humidity</p>
<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="">
</div>
<div class = "row" id="futureCast"></div>
`)

}

// function to get future weather and render it
async function getFutureWeather(url) {
    const response = await fetch(url);
    const data = await response.json();
    const handledData = []

    // offset finds max temp of first day and uses that as starting point for picking a data point to show for each day
    let offset = 0
    for (let i = 0; i < 8; i++) {
        if(data.list[i].main.temp>data.list[offset].main.temp){
            offset = i
        }

    }

    for (let i = 0; i < 5; i++) {

        let obj = {
            date: data.list[(i * 8 + offset)].dt_txt,
            temp: data.list[(i * 8 + offset)].main.temp,
            wind: data.list[(i * 8 + offset)].wind.speed,
            humidity: data.list[(i * 8 + offset)].main.humidity,
            icon: data.list[(i * 8 + offset)].weather[0].icon

        }
        handledData.push(obj)
    }

    renderFutureWeather(handledData)
    return data;
}

// function to render the future weather
function renderFutureWeather(handledData) {
  
    let tomorrow = new Date();
    for (data of handledData) {
        tomorrow.setDate(tomorrow.getDate() + 1);
        const temp = data.temp
        const wind = data.wind
        const humidity = data.humidity
        const icon = data.icon
        let day = tomorrow.getDate();
        let month = tomorrow.getMonth() + 1;
        let year = tomorrow.getFullYear();
        $('#futureCast').append(`<div class="col card">
        <h4>${month}/${day}/${year}</h4>
        <p>${temp} °F</p>
        <p>${wind} MPH</p>
        <p>${humidity}% Humidity</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="">

        </div>
        `)
    }

}

//listener to handle a search

$('#wthrBtn').on('click', async function (event) {
    event.preventDefault()
    //this code is to check if city is already on the list before adding it
    let city = $('#searchField').val()
    let a = cityList.some(c => c == city)
    cityList.unshift(city)
    //chatgpt set constructor to remove duplicate searches
    cityList = [...new Set(cityList)]
    localStorage.setItem('cities', JSON.stringify(cityList))
// this adds the city to the ul if it wanst there already
    if(!a){
        const item = `
           <li> <button class="btn btn-primary past-search m-1" id="${city}">${city}</button></li>
        `
    
        $('#searchList').prepend(item)

    }

    let current = 'https://api.openweathermap.org/data/2.5/weather?q=' + $('#searchField').val() + '&appid=cfd6a11b9103f67768d8be5107e773bf&units=imperial'
    let future = 'https://api.openweathermap.org/data/2.5/forecast?q=' + $('#searchField').val() + '&appid=cfd6a11b9103f67768d8be5107e773bf&units=imperial'
    await getCurrentWeather(current)
    await getFutureWeather(future)
})

// listener to handle clicking on a past search
$('#searchList').on('click', '.past-search', async function () {
    let local = this.innerText
    let current = 'https://api.openweathermap.org/data/2.5/weather?q=' + local + '&appid=cfd6a11b9103f67768d8be5107e773bf&units=imperial'
    let future = 'https://api.openweathermap.org/data/2.5/forecast?q=' + local + '&appid=cfd6a11b9103f67768d8be5107e773bf&units=imperial'
    await getCurrentWeather(current)
    await getFutureWeather(future)
})

//pulls past searches and creats the list on page load
$(document).ready(function () {
    pastSearches()

})
