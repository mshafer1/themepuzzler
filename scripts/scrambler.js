

var GET = {}
var seed = 0;
var answer = "";

var CAP_A = 65;

// from https://stackoverflow.com/a/31221374/8100990
if (!String.prototype.includes) {
    String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

// Create Element.remove() function if not exist
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

//from http://stackoverflow/a/20729945
String.prototype.format = function() {
    var str = this;
    for (var i = 0; i < arguments.length; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        str = str.replace(reg, arguments[i]);
    }
    return str;
}


function escapeRegExp(str) { // from https://stackoverflow.com/a/1144788/8100990
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) { // from https://stackoverflow.com/a/1144788/8100990
    return str.replace(new RegExp(escapeRegExp(find), 'gm'), replace);
}

function load_get() { //originally from https:///stackoverflow.com/a/12049737
    GET = {};
    //console.log("parsing get")
    if (document.location.toString().indexOf('?') !== -1) {
        //console.log("found somethings in get string");
        var query = document.location
            .toString()
            // get the query string
            .replace(/^.*?\?/, '')
            // and remove any existing hash string (thanks, @vrijdenker)
            .replace(/#.*$/, '')
            .replace(new RegExp(escapeRegExp('+'), 'g'), ' ')
            .split('&');

        for (var i = 0, l = query.length; i < l; i++) {
            aux = decodeURIComponent(query[i])
                //console.log(aux)
            key = aux.match(/([\d\D]+?\=)/)[0].replace('=', '');
                //console.log(key)
            value = aux.replace(key + "=", "")
                //console.log(value)
            if (key in GET) {
                if (GET[key].constructor === Array) {
                    GET[key].push(value)
                } else {
                    GET[key] = [GET[key], value]
                }
            } else {
                if (key.includes('[]')) {
                    //console.log("Array detected")
                    GET[key] = [];
                    GET[key].push(value)
                } else {
                    GET[key] = value;
                }
                //console.log(key + ":" + GET[key])
                //console.log();
            }
        }
    }
}

function genSeed(){
    return Math.floor(Math.random() * 1E5);
}


function parseSeedFromGet() {
    // get the id integer stored in the GET array
    if('id' in GET) {
        seed = parseInt(GET['id']);
    }
}

// originally from https://stackoverflow.com/a/2450976
function shuffle(array) {
    var result = array.slice();
    var currentIndex = result.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = result[currentIndex];
      result[currentIndex] = result[randomIndex];
      result[randomIndex] = temporaryValue;
    }
  
    return result;
  }


function setup() {
    answer = "";

    Math.seedrandom();
    seed = genSeed();
    load_get();
    if (jQuery.isEmptyObject(GET)) {
        // seed provided
        //console.log("GET empty");
        //console.log(GET);
    }
    else {
        parseSeedFromGet();
    }
    
    //console.log("Seed: " + seed);
    Math.seedrandom(seed);
    $('#idEntry').val(seed);

    var shuffled = shuffle(pieces);
    loadPlayers(shuffled);

    //console.log(pieces);
    console.log(shuffled);

    pieces.forEach(function(e, index) 
    {
        resultIndex = shuffled.indexOf(e);
        //console.log("Index: " + index + "\n\tMovedTo: " + resultIndex)
        answer += String.fromCharCode(CAP_A + resultIndex)}
    );

    link = document.location.toString() + "?id=" + seed;
    if (document.location.toString().indexOf('?') !== -1) {
        link = document.location.toString();
    }
    $('#link').html('<a href="{0}">{0}</a>'.format(link));
}

function loadPlayers(array){
    array.forEach(function(element, index) {
        //console.log(index + ": " + element);
        label = String.fromCharCode(CAP_A + index);
        //console.log(label);

        $('#row' + index).html(genRow(label, index, element));
        //console.log(label);

    });
    $('.sortRegion i').click(function() {
        $(this).focus();
    });
}

function genRow(name, index, audioPath){
    //console.log("index: " +index);
    return '    \
    <div class="slide w3-row-padding w3-padding" value="{0}" id="{1}"> \
        <div class="w3-col s3 m1"> \
            <i class="fas fa-grip-vertical"></i> \
        </div> \
        <div class="w3-col s3 m1"> \
            <span style="em">{0}</span> \
        </div> \
        <div class="w3-col s5 m1"> \
            <audio id="player{1}" class="player" onended="stop(\'{1}\')"> \
                <source src="{2}" type="audio/mpeg"/> \
            </audio> \
                <i id="playButton{1}" class="fas fa-play w3-hover-text-gray playButton" onclick="play(\'{1}\')" ontouchmove="event.preventDefault ? event.preventDefault() : event.returnValue = false; event.stopPropagation();" ondragstart="stopAll();"/> \
        </div> \
    </div> \
    '.format(name, index, audioPath)
}

function play(id) {
    // TODO: make sure all others are stopped
    stopAll();
    var player = document.getElementById('player' + id);
    player.play();
    removeEventListener("ended", stop, false)
    // player.addEventListener('ended', function() {
    //     stop(id);
    // }, false);
    $('#playButton' + id).removeClass("fa-play").addClass("fa-pause");
    $('#playButton' + id).attr("onclick", "stop('" + id + "')");
}

function stopAll() {
    $('.player').each(function(id) {
        stop(id);
    })
}

function playAll(nextID = null) {
    if(nextID === null)
    {
        playAll.idList = [];
        $('.slide').each(function(index) 
        {
            //console.log(index +  ": " + $(this).text() + " - " + $(this).attr("id"))
            playAll.idList.push($(this).attr("id"));
        });
        playAll.playing = true;
        //console.log($('.slide').first()[0]);
        nextID = playAll.idList.shift();
    }
    audioElement = document.getElementById('player' + nextID);
    audioElement.addEventListener('ended', retrigger, false);
    play(nextID);
}

function retrigger() {
    this.removeEventListener("ended", retrigger, false)
    if (playAll.idList.length > 0 && playAll.playing) {
        playAll(playAll.idList.shift());
    }
    else {
        playAll.playing = false;
    }
}

function stop(id) {
    //console.log("stopping: " + id);
    var player = document.getElementById('player' + id);
    stopPlayer(player);
    $('#playButton' + id).removeClass("fa-pause").addClass("fa-play");
    $('#playButton' + id).attr("onclick", "play('" + id + "')");
}

function stopPlayer(player) {
    player.pause();
    player.currentTime = 0;
    
}

function checkAnswer() {
    //console.log('Answer: ' + answer);

    var result = "";
    $('.slide').each(function(index) 
    {
        //console.log(index +  ": " + $(this).text() + " - " + $(this).attr("value"))
        result += $(this).attr("value");
    });
    //console.log("result: " + result);
    return result;
}

function checkScore() {
    $('w3-modal').css('display', 'block');
    document.getElementById('scoreModal').style.display='block'

    content = "";

    response = checkAnswer();
    var count = 0;
    pluralizer = 's';
    for(var i = 0; i < answer.length; i++)
    {
        if( answer[i] == response[i]){
            count++;
            if (count == 1)
            {
                pluralizer = '';
            }
            else {
                pluralizer = 's';
            }
        }
    }
    
    content += "<p>You have " + count + " part" + pluralizer + " correct!</p>";
    
    if(count == answer.length)
    {
        content += "<p>You got it!</p><p>Select another puzzle from the menu :)";
        content += "<p><button class=\"w3-btn w3-black\" onclick=\"document.getElementById('scoreModal').style.display='none'\">Close</button></p>"
    }
    else {
        content += "<p>Would you like to <button class=\"w3-btn w3-black\" onclick=\"document.getElementById('scoreModal').style.display='none'\">try again</button>? Or <a class=\"w3-btn w3-black\" href=\"{1}\">reshuffle</a> answers?".format(seed, window.location.href.split('?')[0] + "?id=" + genSeed());
    }

    $('#scoreTable').html(content);
}

$(document).ready(setup);
