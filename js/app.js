'use strict';
// Array to store information about forest preserve areas in Chicago
// stores name, street, city, latitude and longitude
var mapMarkerData = [
{ 
    name: 'Dan Ryan Woods',
    street: '8300 S Western Ave',
    city: 'Chicago, IL 60620',
    latitude: 41.736284,
    longitude: -87.679113
},
{
    name: 'Thatcher Woods',
    street: '8030 Chicago Ave',
    city: 'Chicago, IL 60153',
    latitude: 41.906679,
    longitude: -87.828845
},
{
    name: 'Thaddeus S. Lechowicz Woods',
    street: '5901 N Central Ave',
    city: 'Chicago, IL 60646',
    latitude: 41.994171,
    longitude: -87.762057
},
{
    name: 'Jerome Huppert Woods',
    street: '536 N Harlem Ave',
    city: 'River Forest, IL 60305',
    latitude: 41.918359,
    longitude: -87.831988
},
{
    name: 'Portage Woods',
    street: 'W 47th St',
    city: 'Berwyn, IL 60402',
    latitude: 41.810603,
    longitude: -87.804270
},
{
    name: 'Forest Glen Woods Picnic Grove',
    street: '5400 N Lawler Ave',
    city: 'Chicago, IL 60630',
    latitude: 41.980755,
    longitude: -87.755739
},
{
    name: 'Irene C. Hernandez Picnic Grove',
    street: '4498 Foster Ave',
    city: 'Chicago, IL 60630',
    latitude: 41.976177,
    longitude: -87.740006
},
{
    name: 'Catherine Chevalier Woods',
    street: '5564 N East River Rd',
    city: 'Chicago, IL 60706',
    latitude: 41.976463,
    longitude: -87.852520
},
{
    name: 'Eggers Grove',
    street: '11200 S Ave E',
    city: 'Chicago, IL 60617',
    latitude: 41.946623,
    longitude: -87.847555
},
{
    name: 'Bunker Hill',
    street: 'W Harts Rd',
    city: 'Chicago, IL 60714',
    latitude: 42.006768,
    longitude: -87.789930
},
{
    name: 'White Eagle Woods',
    street: '7317 40th St',
    city: 'Lyons, IL 60534',
    latitude: 41.822695,
    longitude: -87.806113
},
{
    name: 'Hiawatha Park',
    street: '8029 West Forest Preserve Drive',
    city: 'Chicago, IL 60634',
    latitude: 41.948014,
    longitude: -87.825467
},
{
    name: 'McCormick Woods',
    street: 'S 1st Ave',
    city: 'Riverside, IL 60546',
    latitude: 41.844126,
    longitude: -87.828845
}];

// Global array variable to hold makers
var markers = [];
// Global array variable to hold infoWindows onjects corresponding to markers
var infoWindows = [];
// Global array variable to hold content to show when marker is clicked
var infoWindows_content = [];
// Global variable to indicate whether map api is initialized
var mapInitialized = false;
// Global variable to hold the map object
var globalMap;

// MapMarker object which is part of the data Model
// It contains name, street, city, latitude
// longitude as knockout js observerables - bound to HTML elements
// address is a knockout computed observable that contains street 
// and city concatenated with comma in between.
// latlon is a knockout computed observable that contains 
// latitude and longitude concatenated with |.
// latlon2 is a knockout computed observable that contains 
// latitude and longitude concatenated with a comma in between. 
var MapMarker = function(data) {
    this.name = ko.observable(data.name);
    this.street = ko.observable(data.street);
    this.city = ko.observable(data.city);

    this.address = ko.computed(function() {
        return this.street() + ", "+ this.city();
    }, this);

    this.latitude = ko.observable(data.latitude);
    this.longitude = ko.observable(data.longitude);

    this.latlon = ko.computed(function() {
        return this.latitude() + "|" + this.longitude();
    }, this);

    this.latlon2 = ko.computed(function() {
        return this.latitude() + "," + this.longitude();
    }, this);
};


// ViewModel:
// 1. It creates the markerList - a knockout observable array
// which stores the map markers for all the forest preserve areas
// listed above.
// 2. It creates and maintains the filteredMarkers - a knockout computed observable array
// which is derived from the markerList based on matching with the filter/search string.
// filteredMarkers is dependent on the filter string.
var ViewModel = function() {
    var self = this;
    var markers_len = 0;

    //create markerList, an observable Array with the MapMarker objects
    //corresponding to all the forest preserve areas listed above
    // markers_len gathered here will be used in other places in this file
    this.markerList = ko.observableArray([]);
    mapMarkerData.forEach(function(mapItem) {
        self.markerList.push(new MapMarker(mapItem));
        markers_len++;
    });

    // stringStartsWith is a function that returns true or false based on 
    // whether string starts with startsWith
    var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
    };

    // filter - a observable that contains the filter search string
    this.filter = ko.observable("");


    this.wikiTitle = ko.observable('Click on a Forest Preserve in the list and find relevant Wikipedia reviews here!');

    var WikiReview = function(titlename, url) {
        this.name = titlename;
        this.url = url;
    };

    this.wikiReviews = ko.observableArray([]);

    this.yelpTitle = ko.observable('Click on a Forest Preserve in the list and find relevant yelp reviews here!');

    var YelpReview = function(titlename, url, ratingImage) {
        this.name = titlename;
        this.url = url;
        this.ratingImage = ratingImage;
    };

    this.yelpReviews = ko.observableArray([]);

    // filteredMarkers - a computed observable array based on:
    // 1. if fitler is not set, returns markerList as is
    //    along with that, if map is already initialized, it sets all the markers to be visible
    //    sets the marker animation to DROP and closes any open infoWindows for the markers.
    // 2. if fitler is set then it first determines all the markers in MarkerList that begin with it.
    //    following that, if map is initialized, it identifies and only shows those markers on map that begin with the filter string
    //    Changes the marker animation to BOUNCE and also shows the infowindows for only those markers.
    // This leads to display fitlered list and showing only the filtered markers on the map.
    this.filteredMarkers = ko.computed(function() {
        var filter = this.filter().toLowerCase();
        displayWikipediaReviews(-1);
        displayYelpReviews(-1);
        if(!filter) {
            if (mapInitialized === true) {
               for (var i = 0; i < markers_len; ++i) {
                    markers[i].setVisible(true);
                    markers[i].setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                    markers[i].setAnimation(google.maps.Animation.DROP);
                    infoWindows[i].close(globalMap, markers[i]);
                }
            }
            return this.markerList();
        } else {
            var newMarkerList = ko.utils.arrayFilter(this.markerList(), function(marker) {
                return stringStartsWith(marker.name().toLowerCase(), filter);
            });
            
            if (mapInitialized === true) {
                for (var i = 0; i < markers_len; ++i) {
                    markers[i].setVisible(true);
                }
                for (var i = 0; i < markers_len; ++i) {
                    var found = false;
                    var titleName = markers[i].getTitle();
                    for (var j = 0; j < newMarkerList.length;++j) {
                       if (titleName === newMarkerList[j].name()) {
                          found = true;
                       }
                    }
                    if (found === false) {
                        markers[i].setVisible(false); // marker not is filtered list, so do no show it on map
                        infoWindows[i].close(globalMap, markers[i]); // close the infoWindow 
                    } else { // marker in filtered list
                        markers[i].setAnimation(google.maps.Animation.BOUNCE); // set marker animation to Bounce
                        markers[i].setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                        infoWindows[i].setContent(infoWindows_content[i]); // set and show the infoWindow for the marker
                        infoWindows[i].open(globalMap, markers[i]);
                    }
                }
            }
           return newMarkerList;
        }
     }, this);

    // displayMarker - the function is invoked when a forest preserve item is clicked
    this.displayMarker = function() {
        if (mapInitialized === true) {
                for (var i = 0; i < markers_len; ++i) {
                    if (markers[i].getTitle() === this.name()) {
                        markers[i].setVisible(true);
                        markers[i].setAnimation(google.maps.Animation.BOUNCE);
                        markers[i].setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                        infoWindows[i].setContent(infoWindows_content[i]); 
                        infoWindows[i].open(globalMap, markers[i]);
                        displayWikipediaReviews(i);
                        displayYelpReviews(i);
                    } else {
                        markers[i].setVisible(false);
                        infoWindows[i].close(globalMap, markers[i]);
                    }

                }
        }
    };

    this.showAll = function() {
        if (mapInitialized === true) {
                for (var i = 0; i < markers_len; ++i) {
                        markers[i].setVisible(true);
                        markers[i].setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                        markers[i].setAnimation(google.maps.Animation.DROP);
                        infoWindows[i].close(globalMap, markers[i]);            
                }
                displayWikipediaReviews(-1);
                displayYelpReviews(-1);

        }
        this.filter("");
    };

    // clear - the function is invoked when clear button is selected by the user
    this.clear = function() {
        // this function sets filter to empty string
        this.filter("");
        displayWikipediaReviews(-1);
        displayYelpReviews(-1);
    };

    // displayWikipediaReviews takes the index of the marker clicked by user
    // (this is passed to the function by displayMarker function) and uses
    // the ajax asynchronously query to Media Wiki API
    // to obtain results and updates the wikiTitle and wikiReviews knockout observables 
    // The Wiki URL uses geosearch and hence uses the latitude and longitude
    function displayWikipediaReviews(clickedMarkerIndex) {

        if (clickedMarkerIndex != -1) {

            // Plug in the latlon provided in the wiki media geosearch URL
            var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gslimit=10&gscoord='+self.markerList()[clickedMarkerIndex].latlon()+'&format=json&callback=?';
            // Error handling - if no response, an error is shown
            var wikiRequestTimeout = setTimeout(function() {
               self.wikiReviews.removeAll();
               self.wikiTitle('failed to get wikipedia results');
            }, 8000);

            $.ajax({
                url: wikiUrl,
                dataType: 'jsonp',
                success: function(response) {
                    self.wikiReviews.removeAll();
                    var articleList = response.query["geosearch"];
                    for (var i=0;i < articleList.length; i++) {
                      var articlePageId = articleList[i].pageid;
                      var articleTitle = articleList[i].title;
                      var url = 'https://en.wikipedia.org/?curid=' + articlePageId;
                      self.wikiReviews.push(new WikiReview(articleTitle, url));
                    }
                    clearTimeout(wikiRequestTimeout);
                    self.wikiTitle('Wikipedia Results for ' + self.markerList()[clickedMarkerIndex].name());
                }
            });
        } else {
            self.wikiTitle('Click on a Forest Preserve in the list and find relevant Wikipedia reviews here!');
            self.wikiReviews.removeAll();
        }
    };

    // displayYelpReviews takes the index of the marker clicked by user
    // (this is passed to the function by displayMarker function) and uses
    // the ajax asynchronously query to Yelp API 2.0
    // to obtain results and updates the yelpTitle and yelpReviews knockout observables 
    // The Yelp URL uses geosearch and hence uses the latitude and longitude and also address
    function displayYelpReviews(clickedMarkerIndex) {

        if (clickedMarkerIndex != -1) {
            // auth object to hold OAUTH 1.0 paramters
            var auth = { 
                consumerKey: "xWuLN66vI9E6iIqZZiFaUw", 
                consumerSecret: "dm_9nosRLIE-7KV7jWNR6hNcXiA",
                accessToken: "L4hQysaiwzPBkkmIRZO_3OHRs_zmlL_w",
                accessTokenSecret: "v5p1MyECZrslYhjyN4FDjENpsdM",
                serviceProvider: {
                    signaureMethod: "HMAC-SHA1"
                }
            };
            // parameters to search based on
            var category = 'parks';
            var accessor = {
                consumerSecret: auth.consumerSecret,
                tokenSecret: auth.accessTokenSecret
            };
            // All the search and oauth parameters are pushed to an array
            var parameters = [];
            parameters.push(['category_filter', category]);
            parameters.push(['location', self.markerList()[clickedMarkerIndex].address()]);
            parameters.push(['cll',self.markerList()[clickedMarkerIndex].latlon2()]);
            parameters.push(['name',self.markerList()[clickedMarkerIndex].name()]);
            parameters.push(['callback', 'cb']);
            parameters.push(['oauth_consumer_key', auth.consumerKey]);
            parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
            parameters.push(['oauth_token', auth.accessToken]);
            parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

            var message = { 
                'action': 'http://api.yelp.com/v2/search',
                'method': 'GET',
                'parameters': parameters 
            };

            OAuth.setTimestampAndNonce(message);  
            OAuth.SignatureMethod.sign(message, accessor);
            var parameterMap = OAuth.getParameterMap(message.parameters);
            parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);


            // Error handling - if no response, an error is shown
            var yelpRequestTimeout = setTimeout(function() {
                self.yelpTitle('failed to get Yelp reviews');
                self.yelpReviews.removeAll();
            }, 60000);

            $.ajax({
                'url': message.action,
                'data': parameterMap,
                'cache': true,
                'dataType': 'jsonp',
                'type': 'get',
                'success': function(data, textStats, XMLHttpRequest) {
                    var articleList = data["businesses"];
                    //start with setting empty string to the yelp-links element
                    self.yelpReviews.removeAll();

                    for (var i=0;i < articleList.length; i++) {
                        var url =  articleList[i].url;
                        //yelp_content = yelp_content + '<li><a href="'+url+'">'+articleList[i].name+" "+'</a><img src="'+articleList[i].rating_img_url+'"></li>';
                        self.yelpReviews.push(new YelpReview(articleList[i].name, url,articleList[i].rating_img_url));
                    }
                    clearTimeout(yelpRequestTimeout);
                    self.yelpTitle('Yelp Results for ' + self.markerList()[clickedMarkerIndex].name());

                },
                'error': function(data, textStats, XMLHttpRequest) {
                    console.log('Yelp query did not work');
                    console.log(XMLHttpRequest);
                //$yelpElem.text("failed to get Yelp reviews");
                }
            });
        } else {
            self.yelpTitle('Click on a Forest Preserve in the list and find relevant Yelp reviews here!');
            self.yelpReviews.removeAll();
        }
    };
};

ko.applyBindings(new ViewModel());

// initMap - This function is invoked by googleSuccess callback function
// In this function the markers and infoWindows are created.
// event listeners for click action is setup
function initMap(map) {
        globalMap = map;
        // create markers for all the forest preserves
        for (var l = 0; l < mapMarkerData.length; l++) {

            var latLng = new google.maps.LatLng(
                    mapMarkerData[l].latitude,
                    mapMarkerData[l].longitude);

            var marker = new google.maps.Marker({
                    position: latLng,
                    animation: google.maps.Animation.DROP,
                    title: mapMarkerData[l].name,
                    icon:'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    map: globalMap
                });
            // push the marker to the global markers array
            markers.push(marker);
            // createa InfoWindow object
            var infoWindow = new google.maps.InfoWindow();
            // create the content string which shows the address, latitude, longitude and the streetview image
            var content = '<div id="content">'+
                           '<div id="siteNotice">'+
                           '</div>'+
                           '<h2 id="firstHeading" class="firstHeading">' + mapMarkerData[l].name + '</h2>'+
                           '<div id="bodyContent">'+
                           '<p><b>Address: </b>' + mapMarkerData[l].street + ", " + mapMarkerData[l].city +
                           '<b> latitude: </b> '+ mapMarkerData[l].latitude +
                           '<b> longitude: </b>'+ mapMarkerData[l].longitude + '</p><br><br>' +
                           '<img src="http://maps.googleapis.com/maps/api/streetview?size=600x100&location='+ mapMarkerData[l].street + ", " + mapMarkerData[l].city+'"'+
                           '</div>'+
                           '</div>';
            // Add a listener for mouseover event which will display the infowindow and
            // also sets the animation to BOUNCE
            google.maps.event.addListener(marker, 'click', (function(marker,content,infoWindow) {
                        return function() {
                            infoWindow.setContent(content);
                            infoWindow.open(globalMap, marker);
                            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                            //marker.setAnimation(google.maps.Animation.BOUNCE);
                        };  
            })(marker,content,infoWindow));

            // Save the infowindows objects and the content strings in global arrays
            infoWindows_content.push(content);
            infoWindows.push(infoWindow);
        }
    // Now that all markers, infowindows are created and map is initialized,
    // set the mapInitialized variable to true
    mapInitialized = true; 
};
