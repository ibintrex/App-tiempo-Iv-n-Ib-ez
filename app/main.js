import '../assets/sass/main.scss'
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1IjoiaXZhbmliYW5leiIsImEiOiJja3AyeGRzNHUwYTF2MnZtazZpNHNzMHNiIn0.ZD6ykUSCY7ZDzAVKmYOLkg'



window.addEventListener("load", () => {
    loadMapView();

});


let view;
let map;
let markersPositions;
let mapPosition;
let weather;


const loadMarkers = () => {

    const localStorageMarkers = localStorage.getItem("markers");
    if (localStorageMarkers ==null) {
        markersPositions =[];
    } else {
        markersPositions = JSON.parse(localStorageMarkers);
    }
}

const loadMapInfo = () => {
    const localStoragePosition = localStorage.getItem("map-info");
    if (localStoragePosition ==null) {
        mapPosition = {
           center: [0,0],
           zoom: 11
        };
    } else {
        mapPosition = JSON.parse(localStoragePosition);
    }
}

const loadMapView = () => {
    view = "map";
    loadMarkers();
    loadMapInfo();

    renderMapViewHeader();
    renderMapViewMain();
    renderMapViewFooter();
}

const renderMapViewHeader = () => {
    const header = document.querySelector('.header');
    header.innerHTML ="<h2>Busca aquí</h2>";
}

const renderMapViewMain = () => {
    const main = document.querySelector('.main');
    main.innerHTML ='<div id="mapadeivan"></div>';
    
    renderMap();
    renderMarkers();
    initMapEvents();
}

const renderMapViewFooter = () => {
    const footer = document.querySelector('.footer');
    footer.innerHTML ='<span class="fa fa crosshair"></span><span>Ir a mi posición</span>';

    footer.addEventListener("click", () => {
        flyToLocation();
    });

 
}

const renderMap = () => {
    map = new mapboxgl.Map({
        container: "mapadeivan",
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [mapPosition.lng, mapPosition.lat],
        zoom: mapPosition.zoom
    });
}

const renderMarkers = () => {
    markersPositions.forEach(m => {
        console.log(m);
        new mapboxgl.Marker().setLngLat([m.coord.lon,m.coord.lat]).addTo(map);   
    });
}

const flyToLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
       const lng = position.coords.longitude;
       const lat = position.coords.latitude;

       map.flyTo({
           center: [lng, lat],
           zoom: 8
       })
    });
}



const initMapEvents = () => {
    map.on("move",(ev) => {
       const center = ev.target.getCenter();
       const zoom = ev.target.getZoom();
       const storingObj = {
           lat: center.lat,
           lng: center.lng,
           zoom: zoom
       };
       localStorage.setItem("map-info", JSON.stringify(storingObj));
    });

    map.on("click", async(ev) => {
        loadSingleView(ev.lngLat);
    });
}

const loadSingleView = async (lngLat) => {
    view = "single";

    loadSpinner();
   await fetchData(lngLat);
    unloadSpinner();
    renderSingleViewHeader();
    renderSingleViewMain();
    renderSingleViewFooter();
}

const loadSpinner = () => {
   const spinner = document.querySelector(".spinner");
   spinner.classList.add("opened");
}

const unloadSpinner = () => {
    const spinner = document.querySelector(".spinner");
   spinner.classList.remove("opened");
}

const fetchData = async (lngLat) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lngLat.lat}&lon=${lngLat.lng}&appid=b92eb8a2e5fe79e7ea0cfcf4ebb3d1b8`;  
    weather = await fetch(url).then(d => d.json()).then(d => d);
    
}

const renderSingleViewHeader = () => {
    const header = document.querySelector('.header');
    header.innerHTML =`<h2><button><span class="fa fa-chevron-left"></span></button>${weather.name}</h2>`;

    const buttonBack = header.querySelector("button");
    buttonBack.addEventListener("click", () => {
        loadMapView();
    })
}

const renderSingleViewMain = () => {
    console.log(weather)
    const main = document.querySelector('.main');
    main.innerHTML =`<p>Contry:<strong>${weather.sys.country}</strong></p>
    <p>Description:<strong>${weather.weather[0].description}</strong></p>
    <p>Wind speed:<strong>${weather.wind.speed}</strong>km/h</p>
    <p>Humidity:<strong>${weather.main.humidity}</strong>%</p>
    <p>Pressure:<strong>${weather.main.pressure}</strong>PA</p>
    <p>Temp:<strong>${weather.main.temp}</strong>K</p>
    <p>Temp max:<strong>${weather.main.temp_max}</strong>K</p>
    <p>Temp min:<strong>${weather.main.temp_min}</strong>K</p>
    `;

}

const renderSingleViewFooter = () => {
    const footer = document.querySelector('.footer');
    footer.innerHTML ='<span class="fa fa save"></span><span>Save Data</span>';

    footer.addEventListener("click", () => {
        saveMarker();
        loadMapView();
    });

    
}

const saveMarker = () => {
    markersPositions.push(weather);
    localStorage.setItem("markers", JSON.stringify(markersPositions));

    
}