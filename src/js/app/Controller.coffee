define(["app/can", "app/models/Verb", "app/models/Quiz"], (can, Verb, Quiz) ->
    # stupid helper function to load templates accounting for the verbose
    # name that the preloader automatically gives them (and which I can't seem to change)
    template = (shortName) -> "src_js_app_views_"+shortName+"_mustache"

    can.Control.extend(
        init: (el) ->
            can.route(':screen/:set')
            can.route(':screen')
            can.route.ready()

            if not can.route.attr('screen')
                can.route.attr({'screen':'start'}, true)

        ':screen/:set route': (data) ->
            if data.screen is 'study'
                @showQuiz(can.route.attr('set'))

            else
                can.route.removeAttr('set')

        ':screen route': (data) ->
            if data.screen is 'start' 
                @showStartScreen() 

            else if data.screen is 'results' and @quiz
                @showResultsScreen()

            else
                can.route.attr('screen', 'start')

        'showStartScreen': -> 
            @element.empty().append(can.view(template('start')))

        'showQuiz': (setString) ->
            if setString in ['all', 'irregulars']
                params = if setString is 'irregulars' then {'irregular':true} else {}

                Verb.findAll(params, (verbs) =>
                    @quiz = new Quiz(verbs, $.extend({}, Verb.validTenseSubjectsMap));
                    start();
                );           
            
            else
                verbKeys = setString.split(',')
                filterBy = if isNaN(Number(verbKeys[0])) then 'infinitive' else 'id'
                verbKeys = if filterBy=='id' then verbKeys.map((v) -> v*1) else verbKeys;

                Verb.findBy(filterBy, verbKeys, (verbs) =>
                    try
                        @quiz = new Quiz(verbs, $.extend({}, Verb.validTenseSubjectsMap))

                    catch e
                        @quiz = undefined

                    start()
                )

            start = =>
                @element.empty().append(can.view(template('app'), {
                    'quiz': @quiz, 
                    'tenses': Object.keys(Verb.validTenseSubjectsMap), 
                    'updateTenseList': () => @updateTenseList()
                }));

        showNewPrompt: ->
            @quiz.nextPrompt();
            $('#answer').val('').focus();
            $('.feedback').remove();

        'updateTenseList': ->
            $('#tenses input', this.element).each((index, value) =>
                el = $(value)
                checked = el.prop('checked')
                tense = el.attr('data-tense-name')

                @quiz[if checked then 'enableTense' else 'disableTense'](tense)
            )
            $('#answer').val('').focus()

        'showResultsScreen': ->
            @element.empty().append(can.view(template('results'), {
                'completedVerbs': @quiz.completedVerbs(), 
                'score': @quiz.score,
                'missedVerbsUrl': can.route.url({'screen':'study', 'set':@getMissedVerbsString()})
            }))

        'button.start click': (el, e) ->
            e.preventDefault()
            can.route.attr({'screen':'study', 'set': if not $(e.target).hasClass('all') then 'irregulars' else 'all'}, true)

        'submit': (el, event) ->
            givenAnswer = $('#answer').val() 
            correct = @quiz.answerIsCorrect(givenAnswer)
            submit = $('input[type=submit]', this.element)

            event.preventDefault();
            
            @quiz.recordAnswer(givenAnswer);

            @element.find('fieldset:first-child').after(
                can.view(template('feedback'), {
                    'correct':correct, 
                    'answer':this.quiz.currentAnswer
                })
            )

            handleKeypress = (e) =>
                e.preventDefault();

                if @quiz.done
                    can.route.attr({'screen':'results'}, true)
                    @element.unbind("keydown", handleKeypress)

                else if not (e.ctrlKey || e.altKey || e.metaKey)
                    @showNewPrompt()
                    @element.unbind("keydown", handleKeypress);

            @element.bind("keydown", handleKeypress);

        getMissedVerbsString: ->
            return this.quiz.missedVerbs().map((val) -> val.verb.id).join();
            ###
            AN OLD APPROACH FOR RETAINING WHOLE QUIZ STATES
            //this isn't encyrption; it's obfuscation. And that's fine. 
            //It's like a running-key vigenere where the key is used repeatedly and is in the source code.
            function obfuscate(string) {
                return Array.prototype.map.call(string, function(val, key) { return String.fromCharCode(val.charCodeAt(0)+key); }).join("");
            }
            //need to capture past answers, past right answers, remaining verbs, score, tenses
            var remainingVerbsString = .join(),
                completedVerbsString = this.completedVerbs.map(function(val) { return obfuscate(val.answer)+':'+obfuscate(val.response); });

            return [remainingVerbsString, this.pointsScored, this.possiblePoints, completedVerbsString].join('=');
            ###
    )
)