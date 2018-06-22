let map;
let infowindow;
let toptenthings = [];
let bounds;
let markers = [];

function initMap() {

    infowindow = new google.maps.InfoWindow();
    //Setting default view of the map
    let city = { lat: 29.7765065, lng: -95.4201377 };
    let mapOptions = {
        zoom: 4,
        center: city
    }
    
    //Initalizing map at $mapArea with the map options settings 
    map = new google.maps.Map($('#mapArea')[0], mapOptions);
    
    let $cityInput = $('#cityInput')[0];
    let autocomplete = new google.maps.places.Autocomplete($cityInput, {types: ['(cities)']});

    //Event listening for place changed which will change view of map to city selected
    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        let place = autocomplete.getPlace(); 
        searchNearbyServices(place);
    })

}

function searchNearbyServices(place){
    if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
    }
    // If the place has a geometry but no viewport, then present it on a map based on this setting.
    if (!place.geometry.viewport) {
        map.setCenter(place.geometry.location);
        map.setZoom(17);  // Why 17? Because it looks good.
    } 
    
    let service = new google.maps.places.PlacesService(map);
    //Finding services based on the set parameters of the requested city and then using a callback function
    let cityName = place.address_components[0].short_name
    if (cityName === "New York") {
        cityName += " City"
    }
    service.nearbySearch({
        location: place.geometry.location,
        radius: 20000,
        keyword: "Things to do in " + cityName,
        rankby: "prominence",
        zoom: 5
    }, callback);
}

//Callback that will return top 10 results
function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        //Resetting the toptenthings variable and deleting any markers on the map if exist
        clearOverlays();
        toptenthings = [];
        
        bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < 10; i++) {
            //Pushing each JSON object to the toptenthings array variable
            toptenthings.push(results[i]);
            console.log(toptenthings[i]);
        }
        //Creating markers based on the toptenthings array variable
        for (let i = 0; i < toptenthings.length; i++) {
            //Create a marker each item
            createMarker(toptenthings[i]);
        }
        //Fitting the map boundary to show all markers of the search 
        map.fitBounds(bounds);
    }
}

function createMarker(place) {
    let marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });
    markers.push(marker);
    //Extending the boundary of the map based on marker's location
    bounds.extend(place.geometry.location);
    //Marker's click event listener that will generate a popup infowindow 
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent('<img src="' + place.icon + '" width="16" height="16"><div><strong>' + place.name + '</strong><br>' + 'Address: ' + place.vicinity);
        infowindow.open(map, this);
    });
}

function clearOverlays() {
    for (var i = 0; i < markers.length; i++ ) {
      markers[i].setMap(null);
    }
    markers = [];
  }

$(document).on('click', '#btnSearch', function () {
    
    let citySearch = $('#cityInput').val().trim();
    console.log(citySearch)
    
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + citySearch + "&key=AIzaSyDg5NeULyIuOpXrGgUWNTAmc4Ect-SsFDU",
        method: "GET"
    })
    .then(function (result) {
        if(result.length !== 0) {
            searchNearbyServices(result.results[0]);
        }
    })
})


