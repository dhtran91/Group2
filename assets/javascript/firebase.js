var app_firebase = {};

(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB0mr6ZbTypb6IqNKZ1_1PsWThkTXFimrs",
        authDomain: "travel-itinerary-6c450.firebaseapp.com",
        databaseURL: "https://travel-itinerary-6c450.firebaseio.com",
        projectId: "travel-itinerary-6c450",
        storageBucket: "",
        messagingSenderId: "108354524076"
    };
    firebase.initializeApp(config);

    app_firebase = firebase;
})();