var map;
var infowindow;

function initMap() {
    infowindow = new google.maps.InfoWindow();
    //Setting long and lat
    let city = { lat: 29.7765065, lng: -95.4201377 };
    let mapOptions = {
        zoom: 4,
        center: city
    }
    map = new google.maps.Map(document.getElementById('mapArea'), mapOptions);
    var service = new google.maps.places.PlacesService(map);
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    var input = document.getElementById('cityInput');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    //Event listening for place changed
    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();

        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }

        marker.setPosition(place.geometry.location);
        

        //Finding the top 10 things to do based on autocomplete location and using the callback function
        service.nearbySearch({
            location: place.geometry.location,
            radius: 20000,
            keyword: "Things to do in " + place.address_components[0].short_name,
            rankby: "prominence"
        }, callback);
    })
}
let toptenthings = [];
//Callback that will return top 10 results based on nearbysearch parameters
function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        if (toptenthings.length !== 0) {
            toptenthings = [];
        }
        for (var i = 0; i < 10; i++) {  
            //Will create a marker for each JSON
            createMarker(results[i]);
            toptenthings.push(results[i]);
            //Console logging to see the object
            console.log(toptenthings[i]);
        }
    }
}


function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    //Adding a click event listener to the marker that will generate the popup infowindow 
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent('<img src="' + place.icon + '" width="16" height="16"><div><strong>' + place.name + '</strong><br>' + 'Address: ' + place.vicinity + '</div><a href="#">Add to my Itinerary</a>');
        infowindow.open(map, this);
    });
}

$(document).on('click', '#btnSearch', searchCity)
function searchCity() {
    let citySearch = $('#cityInput').val().trim();
    //need to find long and lat of input
    console.log(citySearch);

}
