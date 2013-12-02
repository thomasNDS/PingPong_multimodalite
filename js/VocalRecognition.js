(function($)
{
    var $result = $('#result');
    var $words = null;

    if ('webkitSpeechRecognition' in window) {
        var recognition = new webkitSpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.start();

        recognition.onresult = function(event) {
            $result.text('');
            for (var i = event.resultIndex; i < event.results.length; i++) {
                var transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    $result.text(transcript);
                    //recognition.stop();
                    $words = transcript.split(' ');

                    var pause = "pause";
                    var contains_pause = false;
                    var stop = "stop";
                    var contains_stop = false;
                    var demarrer = "démarrer";
                    var jouer = "jouer";
                    var contains_demarrer = false;

                    for (var j = 0; j < $words.length; j++) {
                        //console.log($words[j]);
                        if ($words[j].toLowerCase() === pause.toLowerCase()) {
                            contains_pause = true;
                        }
                        if ($words[j].toLowerCase() === stop.toLowerCase()) {
                            contains_stop = true;
                        }
                        if (($words[j].toLowerCase() === demarrer.toLowerCase()) || ($words[j].toLowerCase() === jouer.toLowerCase())) {
                            contains_demarrer = true;
                        }
                    }

                    /*$.each($words, function(value) {
                     console.log('string');
                     if (value.toLowerCase() === pause.toLowerCase()) {
                     contains_pause = true;
                     }
                     if (value.toLowerCase() === stop.toLowerCase()) {
                     contains_stop = true;
                     }
                     if ((value.toLowerCase() === demarrer.toLowerCase()) || (value.toLowerCase() === jouer.toLowerCase())){
                     contains_demarrer = true;
                     }
                     });*/
                    if (contains_pause) {
                        // APPELER FONCTION PAUSE //
                        console.log('PAUSE');
                        pauses();
                    }
                    if (contains_stop) {
                        // APPELER FONCTION STOP //
                        console.log('STOP');
                        pauses();
                    }
                    if (contains_demarrer) {
                        // APPELER FONCTION DEMARRER //
                        console.log('DEMARRER');
                        beginGame();
                    }
                    return true;
                }
                else {
                    $result.text($result.text() + transcript);
                }

                $result.text(transcript);
            }
        };
    }
})(jQuery);