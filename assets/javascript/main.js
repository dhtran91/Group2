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

    mainApp.logOut =logOut;
})();



var map;
var infowindow;
const hours = ["9:00am", "11:00am", "1:00am", "3:00am", "5:00am"];

var topFirstFive = [];
var topSecondFive = [];

var clickedOptions = false;

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
//Callback that will return top 10 results based on nearbysearch parameters
function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {

        for (var i = 0; i < 10; i++) {
            //Will create a marker for each JSON
            createMarker(results[i]);
            if (i < 5) {
                topFirstFive.push(results[i]);
                console.log(topFirstFive);

            } else {
                topSecondFive.push(results[i]);

            }
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

$(document).on('click', '#btnSearch', searchCity)
function searchCity() {
    let citySearch = $('#cityInput').val().trim();
    //need to find long and lat of input
    console.log(citySearch);
}


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
        tr += '<td>' + fiveOptions[i].name + '</td>';
        tr += '</tr>';
    }

    table += tr;
    table += '</tbody></table>';

    $('#ititneraryTable').append(table);
    $('#ititneraryTable').css("background-color", "white");
    $('#ititneraryTable').css("border-radius", "25px");

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

