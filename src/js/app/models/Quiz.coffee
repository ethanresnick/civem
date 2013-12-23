define ["app/can"], (can) ->
  Quiz = can.Model.extend(
    subjectNameToEnglish: (subject) ->
      subjectMap =
        io: "I"
        tu: "you"
        lui: "he/she"
        noi: "we"
        voi: "you all"
        loro: "they"

      if subjectMap[subject] is undefined
        throw new Error("Invalid subject. Subject must be one of: " + Object.keys(subjectMap).concat())

      subjectMap[subject]

    adaptDefinitionString: (definition, subject) ->
      
      #            //remove the "to..." that typically accompanies the infinitive
      #            var newDef = definition.replace(/(^|\; )(to)/g, "$1");
      #
      #            //replace the generic "yourself" with the appropriate subject
      #            var correctSelf, correctBe;
      #            switch(subject) {
      #                case 'io': 
      #                    correctSelf = 'myself'; 
      #                    correctBe = 'am';
      #                    break;
      #                case 'tu': 
      #                    correctSelf = 'yourself'; 
      #                    correctBe = 'are';
      #                    break;
      #                case 'lui': 
      #                    correctSelf = 'him/herself'; 
      #                    correctBe = 'is';
      #                    break;
      #                case 'noi': 
      #                    correctSelf = 'ourselves'; 
      #                    correctBe = 'are';
      #                    break;
      #                case 'voi': 
      #                    correctSelf = 'yourselves'; 
      #                    correctBe = 'are';
      #                    break;
      #                case 'loro': 
      #                    correctSelf = 'themselves'; 
      #                    correctBe = 'are';
      #                    break;
      #            }
      #            newDef = newDef.replace(/oneself|yourself/g, correctSelf);
      #            newDef = newDef.replace(/(\b)be(\b|$)/g, "$1" + correctBe+"$2");
      #
      #            return newDef; 
      definition

    cleanAnswer: (answer, subject) ->
      cleanAnswer = answer.toLowerCase()
      if cleanAnswer.indexOf(subject + " ") is 0
        cleanAnswer = cleanAnswer.slice(subject.length + 1)
      cleanAnswer
  ,
    init: (verbs, tenseMap) ->
      throw new Error("No verbs provided to study.")  if verbs.length is 0
      @_remainingVerbs = verbs or []
      @_completedVerbs = []
      @attr "done", false
      @attr "tenseMap", tenseMap
      @attr "pointsScored", 0
      @attr "possiblePoints", 0
      @nextPrompt()

    nextPrompt: ->
      index = Math.round(Math.random() * (@_remainingVerbs.length - 1))
      unless @done
        @attr "currentVerb", @_remainingVerbs[index]
        @attr "currentTense", @randomTense()
        @attr "currentSubject", @randomSubject(@currentTense)
        @attr "currentAnswer", @currentVerb.conjugate(@currentSubject, @currentTense)
        @attr "enSubjectName", Quiz.subjectNameToEnglish(@currentSubject)
        @attr "adaptedDefinition", Quiz.adaptDefinitionString(@currentVerb.definition, @currentSubject)
        @_remainingVerbs.splice(index, 1)

    recordAnswer: (answer) ->
      pointsEarned = @pointsForAnswer(answer)
      @attr "pointsScored", @pointsScored + pointsEarned
      @attr "possiblePoints", @possiblePoints + 2
      @attr "score", Math.round(100 * @pointsScored / @possiblePoints)
      @_completedVerbs.push
        verb: @currentVerb
        answer: @currentAnswer
        response: answer
        correct: @answerIsCorrect(answer)

      if @_remainingVerbs.length is 0
        @attr "done", true
        @attr "currentVerb", undefined

    remainingVerbs: ->
      @_remainingVerbs.slice 0

    completedVerbs: ->
      @_completedVerbs.slice 0

    missedVerbs: ->
      @_completedVerbs.filter (val) ->
        not val.correct

    answerIsCorrect: (answer) ->
      @pointsForAnswer(answer) is 2

    pointsForAnswer: (answer) ->
      cleanAnswer = Quiz.cleanAnswer(answer, @currentSubject)
      rightRoot = @getVerbRootFromAnswer(cleanAnswer) is @currentVerb.root
      (if (@currentAnswer is cleanAnswer) then 2 else ((if rightRoot then 1 else 0)))

    
    # Gets the root taking into account the current tense and subject and isReflexive 
    getVerbRootFromAnswer: (answer) ->
      words = answer.split(" ")
      verb = @currentVerb
      tense = @currentTense
      verbIndex = 0
      verbIndex++  if verb.isReflexive
      verbIndex++  if tense is "passato prossimo"
      return ""  if not answer or not words[verbIndex]
      words[verbIndex].substr 0, verb.root.length

    disableTense: (tense) ->
      if @tenseMap[tense]
        
        #adding a disabled prop on the subjects array
        #is a bit awkward, but whatever. it's easy.
        @tenseMap[tense].attr "disabled", true
        if @currentTense is tense
          @attr "currentTense", @randomTense()
          @attr "currentSubject", @randomSubject(@currentTense)
          @attr "currentAnswer", @currentVerb.conjugate(@currentSubject, @currentTense)

    enableTense: (tense) ->
      @tenseMap[tense].attr "disabled", false  if @tenseMap[tense]

    randomTense: ->
      applicableTenses = can.Map.keys(@tenseMap).filter((tense) ->
        not @tenseMap[tense].disabled
      , @)
      applicableTenses = (tense for tense in can.Map.keys(@tenseMap) when not @tenseMap[tense].disabled)
      can.fixture.rand(applicableTenses, 1)[0]

    randomSubject: (tense) ->
      can.fixture.rand(@tenseMap[tense], 1)[0]
  )
  Quiz