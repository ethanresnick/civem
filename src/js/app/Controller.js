define(["app/can", "app/models/Verb", "app/models/Quiz"], function(can, Verb, Quiz) {
	return can.Control.extend({
        init: function(el) {
            can.route(':screen/:set');
            can.route(':screen');
            can.route.ready();

            if(!can.route.attr('screen')) {
                can.route.attr({'screen':'start'}, true);
            }
        },

        ':screen/:set route': function(data) {
            if(data.screen === 'study') {
                this.showQuiz(can.route.attr('set'));
            }
            else {
                can.route.removeAttr('set');
            }
        },

        ':screen route': function(data) {
            if(data.screen=='start') {
                this.showStartScreen();
            }
            else if(data.screen == 'results' && this.quiz) {
                this.showResultsScreen();
            }
            else {
                can.route.attr('screen', 'start');
            }            
        },

        'showStartScreen': function() {
            this.element.empty().append(can.view('startScreen'));
        },

        'showQuiz': function(setString) {
            var el = this.element, self = this, params;

            if(setString=='all' || setString=='irregulars') {

                params = (setString=='irregulars') ? {'irregular':true} : {}; 

                Verb.findAll(params, function(verbs){
                    self.quiz = new Quiz(verbs, $.extend({}, Verb.validTenseSubjectsMap));
                    start();
                });            
            }

            else {
                var test = Verb.findByIds(setString.split(',').map(function(v) { return v*1; }), function(verbs) {
                    self.quiz = new Quiz(verbs, $.extend({}, Verb.validTenseSubjectsMap));
                    start();
                });
            }

            function start() {
                el.empty().append(can.view('appView', {
                    'quiz':self.quiz, 
                    'tenses': Object.keys(Verb.validTenseSubjectsMap), 
                    'updateTenseList': function() { self.updateTenseList(); }
                }));
            }
        },

        showNewPrompt: function() {
            this.quiz.nextPrompt();
            $('#answer').val('').focus();
            $('.feedback').remove();
        },

        'updateTenseList': function() {
            var self = this;
            $('#tenses input', this.element).each(function(index, value) {
                var el = $(value),
                    checked = el.prop('checked'),
                    tense = el.attr('data-tense-name');

                self.quiz[checked ? 'enableTense' : 'disableTense'](tense);
            });
            this.showNewPrompt();
        },

        'showResultsScreen': function() {
            this.element.empty().append(can.view('resultsView', {
                'completedVerbs': this.quiz.completedVerbs, 
                'score': this.quiz.score,
                'missedVerbsUrl': can.route.url({'screen':'study', 'set':this.getMissedVerbsString()})
            }));
        },

        'button.start click': function(el, e) {
            var self = this, params;
            e.preventDefault();
            can.route.attr({'screen':'study', 'set':!$(e.target).hasClass('all') ? 'irregulars' : 'all'}, true);
        },

        'submit': function(el, event) {
            var givenAnswer = $('#answer').val(), 
                self = this, 
                submit = $('input[type=submit]', this.element);
            event.preventDefault();
            
            this.quiz.recordAnswer(givenAnswer);

            this.element.find('fieldset:first-child').after(
                can.view('feedbackView', {
                    'correct':this.quiz.completedVerbs[this.quiz.completedVerbs.length-1].correct, 
                    'answer':this.quiz.currentAnswer
                })
            );

            var handleKeypress = function(e) {
                e.preventDefault();

                if(self.quiz.done) {
                    can.route.attr({'screen':'results'}, true);
                    self.element.unbind("keydown", handleKeypress);
                } 

                else if(!(e.ctrlKey || e.altKey || e.metaKey)) {
                    self.showNewPrompt(); 
                    self.element.unbind("keydown", handleKeypress);
                }
            }
            this.element.bind("keydown", handleKeypress);
        },

        getMissedVerbsString: function() {
            return this.quiz.completedVerbs.filter(function(val) { return !val.correct; }).map(function(val) { return val.verb.id; }).join();
            /* AN OLD APPROACH FOR RETAINING WHOLE QUIZ STATES
            function obfuscate(string) {
                return Array.prototype.map.call(string, function(val, key) { return String.fromCharCode(val.charCodeAt(0)+key); }).join("");
            }
            //need to capture past answers, past right answers, remaining verbs, score, tenses
            var remainingVerbsString = .join(),
                completedVerbsString = this.completedVerbs.map(function(val) { return obfuscate(val.answer)+':'+obfuscate(val.response); });

            return [remainingVerbsString, this.pointsScored, this.possiblePoints, completedVerbsString].join('=');
            */

        },
    });
});