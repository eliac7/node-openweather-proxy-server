let isSubmit = false
let tempName
const submitButton = document.querySelector('button')


function getCurrentTime() {

    const box = document.querySelector('.box')
    var today = new Date()
    var curHr = today.getHours()
    if (curHr < 12) {
        document.body.classList.add('morning')
    } else if (curHr < 18) {
        document.body.classList.add('afternoon')
    } else {
        document.body.classList.add('evening')
    }
}

function getDayName(dateStr, locale) {
    var date = new Date(dateStr);
    return date.toLocaleDateString(locale, {
        weekday: 'long'
    });
}

function triggerToast(reason, cityName) {

    const toastBody = document.querySelector('.toast-body')
    if (reason === 'city') {
        toastBody.innerHTML = `City with name <span class="fw-bold">${cityName}</span> couldn't be found.`
    } else {
        toastBody.innerHTML = 'Please use properly name for city (no numbers allowed or special characters).'
    }

    const toast = document.querySelector('.toast')
    toast.classList.add('show')
    setTimeout(() => toast.classList.remove('show'), 5000)
}

async function getWeatherData(city) {
    const url = `http://localhost:8000/api?q=${city}`
    const input = document.querySelector("input[name='location']")
    const box = document.querySelector('.box')


    //For current forecast weather

    const CurrentWeatherTemp = document.querySelector('.weather-temp')
    const CurrentWeatherDesc = document.querySelector('.weather-desc')
    const WeatherTempLike = document.querySelector('.weather-temp-like>span')

    //For tomorrow forecast weather

    const TomorrowWeatherTemp = document.querySelector('.predictions .date .day-temp p:first-child')
    const TomorrowWeatherDesc = document.querySelector('.predictions .date .day-temp p:nth-child(2)')
    const TomorrowDaySelector = document.querySelector(".predictions .date .day")


    //For after tomorrow forecast weather

    const AfterTomorrowWeatherTemp = document.querySelector(".predictions div:nth-child(2) .day-temp p")
    const AfterTomorrowWeatherDesc = document.querySelector(".predictions  div:nth-child(2) .day-temp  p:nth-child(2)")
    const AfterTomorrowDaySelector = document.querySelector(".predictions  div:nth-child(2) .day")

    try {

        const res = await fetch(url)
        const data = await res.json()

        if (data.message === 'city not found') {
            throw new Error(data.message)
        }

        if (box.classList.contains('loading')) {
            box.classList.remove('loading')
        }

        let name = data.city.name;
        let country = data.city.country;

        //Getting the next 2 days from OpenWeatherMap. It brings totally 40 items for 5 days. Each day has 8 items, so to bring 2 days only, we got only the 16 items on the list.
        //We exclude current day, that's why we start from 8.
        let TomorrowDesc, TomorrowTemp, TomorrowDay, AfterTomorrowDesc, AfterTomorrowTemp, AfterTomorrowDay
        for (var i = 8; i < 24; i += 8) {

            if (i === 8) {
                //Tomorrow forecast weather

                TomorrowDesc = data.list[i].weather[0].description;
                TomorrowTemp = Math.round(data.list[i].main.temp)
                TomorrowDay = data.list[i].dt_txt
            } else {
                //Day after tomorrow forecast weather

                AfterTomorrowDesc = data.list[i].weather[0].description;
                AfterTomorrowTemp = Math.round(data.list[i].main.temp)
                AfterTomorrowDay = data.list[i].dt_txt
            }

        }


        //Current forecast weather

        let CurrentDesc = data.list[0].weather[0].description;
        let CurrentTemp = Math.round(data.list[0].main.temp)
        let CurrentFeelsLike = Math.round(data.list[0].main.feels_like)

        //For current forecast weather

        CurrentWeatherTemp.innerText = CurrentTemp
        CurrentWeatherDesc.innerText = CurrentDesc
        WeatherTempLike.innerText = CurrentFeelsLike

        //For tomorrow forecast weather

        TomorrowWeatherTemp.innerText = TomorrowTemp
        TomorrowWeatherDesc.innerText = TomorrowDesc
        TomorrowDaySelector.innerText = getDayName(TomorrowDay, "en-US");

        //For after tomorrow forecast weather

        AfterTomorrowWeatherTemp.innerText = AfterTomorrowTemp
        AfterTomorrowWeatherDesc.innerText = AfterTomorrowDesc
        AfterTomorrowDaySelector.innerText = getDayName(AfterTomorrowDay, "en-US");


        //Clear value to show placeholder
        input.value = ''
        //Insert value of city to placeholder
        input.placeholder = `${name},${country}`


        const toast = document.querySelector('.toast')


        //If we have previously entered faulty city name, and we type fast enough a valid city name, then we don't need to keep showing the toast.
        if (toast.classList.contains('show')) {
            toast.classList.remove('show')
        }


        isSubmit = false
        submitButton.disabled = true

    } catch (err) {
        if (err.message === 'city not found') {
            triggerToast('city', city)
            input.value = ''
            input.placeholder = tempName

        } else {
            alert('Something went wrong. Please try again later.')
        }

    }

}

document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector('form');
    const input = document.querySelector("input");



    form.addEventListener('focusin', (event) => {
        tempName = input.placeholder;

    });

    form.addEventListener('focusout', (event) => {
        if (!isSubmit) {
            event.target.value = ''
            event.target.placeholder = tempName;
            submitButton.disabled = true

        }
    });

    input.addEventListener('input', (evt) => {
        if (tempName !== evt.target.value) {
            if (submitButton.disabled) {
                submitButton.disabled = false
            }
        } else {
            submitButton.disabled = true
        }
    })



    document.querySelector('form').onsubmit = function (e) {
        e.preventDefault();
        isSubmit = true
        let city = e.target[0].value;
        //Remove numbers
        const regex = /\d/;
        if (!regex.test(city) && city) {
            getWeatherData(city)
        } else {
            input.value = tempName
            triggerToast('number')
        }

        document.activeElement.blur();
    }

    //initial state

    getCurrentTime()

    getWeatherData('Athens')
});