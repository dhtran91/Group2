var mainApp = {};

(function () {
    var uid = null;
    var firebase = app_firebase;

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            uid = user.uid;
        } else {
            uid = null;
            window.location.replace('./login.html');
        }
    });

    function logOut() {
        firebase.auth().signOut();
    }

    mainApp.logOut = logOut;
})();



var map;
var infowindow;
const hours = ["9:00am", "11:00am", "1:00am", "3:00am", "5:00am"];
let bounds;
let markers = [];
var topFirstFive = [];
var topSecondFive = [];
var clickedOptions = false;
let topTenThings = [];

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
    let autocomplete = new google.maps.places.Autocomplete($cityInput, { types: ['(cities)'] });

    //Event listening for place changed which will change view of map to city selected
    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        let place = autocomplete.getPlace();
        searchNearbyServices(place);
    })

}

function searchNearbyServices(place) {
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
        //Resetting the topTenThings variable and deleting any markers on the map if exist
        clearOverlays();
        topFirstFive = [];
        topSecondFive = [];
        bounds = new google.maps.LatLngBounds();

        //Creating markers based on the topTenThings array variable
        for (let i = 0; i < 10; i++) {
            getLocationDetail(results[i])
            //Create a marker each item
            createMarker(results[i]);
            if (i < 5) {
                topFirstFive.push(results[i]);
            } else{
                topSecondFive.push(results[i]);
            }
        }

        //Fitting the map boundary to show all markers of the search 
        map.fitBounds(bounds);
    }
}

function getLocationDetail(place) {
    let queryUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" + place.place_id + "&fields=name,photo,review,website,rating,formatted_phone_number&key=AIzaSyDg5NeULyIuOpXrGgUWNTAmc4Ect-SsFDU"
    $.ajax({
        url: queryUrl,
        method: "GET"
    }).then(function (result) {
        let response = result.result;
        topTenThings.push(response);
    })
}

function populateLocationDetail() {
    let $picArea = $('#picArea');
    $picArea.empty();

    let locationDetail = topTenThings.filter((x) => x.name === $(this).html())[0];
    console.log(locationDetail);

    let locationDiv = $('<div>').attr({
        class: "location-detail-div panel panel-default", 
        "data-name": locationDetail.name
    })
    let headDiv = $('<div>').attr('class', 'panel-heading').append(`<h2>${locationDetail.name}</h2>`);
    let bodyDiv = $('<div>').attr('class', 'panel-body');
    let rateDiv = $('<div>').append(`<span>${locationDetail.rating}</span>`);
    let reviews = $('<ul>').attr('class', 'list-group');
    let photoDiv = `<div class="row">`;
    
    for (let i = 0; i < locationDetail.photos.length; i++) {
        let photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=" + locationDetail.photos[i].photo_reference + "&key=AIzaSyDg5NeULyIuOpXrGgUWNTAmc4Ect-SsFDU";
        photoDiv += `<div class="col-xs-6 col-md-3"><a class="thumbnail" href="${photoUrl}"><img src=${photoUrl} alt="${locationDetail.name}"></a></div>`
    }
    photoDiv += '</div></div>'
    
    for (let i = 0; i < locationDetail.reviews.length; i++) {
        reviews.append(`<li class="list-group-item">${locationDetail.reviews[i].author_name}<br>${locationDetail.reviews[i].text}</li>`);
    }

    bodyDiv.append(rateDiv,photoDiv,reviews);
    $picArea.append(locationDiv.append(headDiv,bodyDiv));
}

$(document).on('click', '.option', populateLocationDetail)

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
        infowindow.setContent('<img src="' + place.icon + '" width="16" height="16"><div><strong>' + place.name + '</strong><br>' + 'Address: ' + place.vicinity + '</div>');
        infowindow.open(map, this);
    });
}

//Clears markers if there's any on the map
function clearOverlays() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}


$(document).on('click', '#btnSearch', function () {
    let citySearch = $('#cityInput').val().trim();
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + citySearch + "&key=AIzaSyDg5NeULyIuOpXrGgUWNTAmc4Ect-SsFDU",
        method: "GET"
    })
        .then(function (result) {
            if (result.length !== 0) {
                searchNearbyServices(result.results[0]);
            }
        })
})

function populateTable(fiveOptions) {


    var table = '<table cellpadding="0" cellspacing="0"  class="table table-striped" id="listPlaces">';
    table += '<thead>';
    table += '<tr>';
    table += '<th style="text-aling: center">Hours</th><th>Place</th>';
    table += '</tr>';
    table += '</thead>';
    table += '<tbody>';
    tr = '';

    for (i = 0; i < fiveOptions.length; i++) {
        tr += '<tr>';
        tr += '<td>' + hours[i] + '</td>';
        tr += '<td class="option">' + fiveOptions[i].name + '</td>';
        tr += '</tr>';
    }

    table += tr;
    table += '</tbody></table>';

    $("#resultsContent").addClass("content");
    $('#ititneraryTable').append(table);

  

    var btnOtherOptions = $(`<button type="button">Other Options</button>`);
    btnOtherOptions.addClass("btn btn-default");
    btnOtherOptions.attr('id', "btnOtherItinerary");

    $('#ititneraryTable').append(btnOtherOptions);
}

$("#btnItinerary").on("click", function () {

    $("#ititneraryTable").empty();


    var city = $('#cityInput').val().trim();

    if (city === "") {
        var p = $(`<p style="color: white" id="error">You must to type a city</p>`);
        $('.inputField').append(p);
    } else {
        $("#error").css('display', 'none');
        populateTable(topFirstFive);
    }
});

function otherOptipns() {

    if (clickedOptions == false) {
        $("#ititneraryTable").empty();
        populateTable(topSecondFive);
        clickedOptions = true;
        $('#btnOtherItinerary').html("Previous options");
    } else {

        $("#ititneraryTable").empty();
        populateTable(topFirstFive);
        clickedOptions = false;
    }

}

$(document).on("click", "#btnOtherItinerary", otherOptipns);
