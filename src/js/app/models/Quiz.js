define(["app/can"], function(can) {
    var Quiz = can.Model.extend({
        subjectNameToEnglish: function(subject) {
            var subjectMap = {'io': 'I', 'tu': 'you', 'lui':'he/she', 'noi':'we', 'voi': 'you all', 'loro': 'they'};
            if(subjectMap[subject]===undefined) {
                throw new Error("Invalid subject. Subject must be one of: " + Object.keys(subjectMap).concat());
            }
            return subjectMap[subject];
        },

        adaptDefinitionString: function(definition, subject) {
            /*
            //remove the "to..." that typically accompanies the infinitive
            var newDef = definition.replace(/(^|\; )(to)/g, "$1");

            //replace the generic "yourself" with the appropriate subject
            var correctSelf, correctBe;
            switch(subject) {
                case 'io': 
                    correctSelf = 'myself'; 
                    correctBe = 'am';
                    break;
                case 'tu': 
                    correctSelf = 'yourself'; 
                    correctBe = 'are';
                    break;
                case 'lui': 
                    correctSelf = 'him/herself'; 
                    correctBe = 'is';
                    break;
                case 'noi': 
                    correctSelf = 'ourselves'; 
                    correctBe = 'are';
                    break;
                case 'voi': 
                    correctSelf = 'yourselves'; 
                    correctBe = 'are';
                    break;
                case 'loro': 
                    correctSelf = 'themselves'; 
                    correctBe = 'are';
                    break;
            }
            newDef = newDef.replace(/oneself|yourself/g, correctSelf);
            newDef = newDef.replace(/(\b)be(\b|$)/g, "$1" + correctBe+"$2");

            return newDef; */
            return definition;
        },

        cleanAnswer: function(answer, subject) {   
            var cleanAnswer = answer;     
            if(answer.indexOf(subject+' ')===0) {
                cleanAnswer = answer.slice(subject.length+1);
            }
            return cleanAnswer.toLowerCase();
        }
    }, {
        init: function(verbs, tenseMap) {
            this._remainingVerbs = verbs || [];
            this._completedVerbs = [];

            this.attr('done', false);
            this.attr('tenseMap', tenseMap);
            this.attr('pointsScored', 0);
            this.attr('possiblePoints', 0);

            this.nextPrompt();
        },

        nextPrompt: function() {
            var index = Math.round(Math.random()*(this._remainingVerbs.length-1));

            if(!this.done) {
                this.attr('currentVerb', this._remainingVerbs[index]);
                this.attr('currentTense', this.randomTense());
                this.attr('currentSubject', this.randomSubject(this.currentTense));
                this.attr('currentAnswer', this.currentVerb.conjugate(this.currentSubject, this.currentTense));
                this.attr('enSubjectName', Quiz.subjectNameToEnglish(this.currentSubject));
                this.attr('adaptedDefinition', Quiz.adaptDefinitionString(this.currentVerb.definition, this.currentSubject));

                this._remainingVerbs.splice(index, 1);
            }
        },

        recordAnswer: function(answer) {
            var pointsEarned = this.pointsForAnswer(answer);
            this.attr('pointsScored', this.pointsScored + pointsEarned);
            this.attr('possiblePoints', this.possiblePoints + 2);
            this.attr('score', Math.round(100*this.pointsScored/this.possiblePoints));

            this._completedVerbs.push({'verb':this.currentVerb, 'answer': this.currentAnswer, 'response': answer, 'correct':this.answerIsCorrect(answer)});

            if(this._remainingVerbs.length==0) { 
                this.attr('done', true);
                this.attr('currentVerb', undefined);
            }
        },

        remainingVerbs: function() {
            return this._remainingVerbs.slice(0);
        },

        completedVerbs: function() {
            return this._completedVerbs.slice(0);
        },

        missedVerbs: function() {
            return this._completedVerbs.filter(function(val) { return !val.correct; });
        },

        answerIsCorrect: function(answer) {
            return this.pointsForAnswer(answer)==2;
        },

        pointsForAnswer: function(answer) {
            var cleanAnswer = Quiz.cleanAnswer(answer, this.currentSubject);
            var rightRoot = this.getVerbRootFromAnswer(cleanAnswer)==this.currentVerb.root;
            return (this.currentAnswer==cleanAnswer) ? 2 : (rightRoot ? 1 : 0);
        },

        /* Gets the root taking into account the current tense and subject and isReflexive */
        getVerbRootFromAnswer: function(answer) {
            var words = answer.split(' '),
                verb = this.currentVerb,
                tense = this.currentTense,
                verbIndex = 0;

            if(verb.isReflexive) { verbIndex++; }
            if(tense=="passato prossimo") { verbIndex++; }

            if(!answer || !words[verbIndex]) { return ''; }

            return words[verbIndex].substr(0, verb.root.length);
        },

        disableTense: function(tense) {
            if(this.tenseMap[tense]) {
                //adding a disabled prop on the subjects array
                //is a bit awkward, but whatever. it's easy.
                this.tenseMap[tense].attr('disabled', true);

                if(this.currentTense == tense) {
                    this.attr('currentTense', this.randomTense());
                    this.attr('currentSubject', this.randomSubject(this.currentTense));
                    this.attr('currentAnswer', this.currentVerb.conjugate(this.currentSubject, this.currentTense));
                }
            }
        },

        enableTense: function(tense) {        
            if(this.tenseMap[tense]) {
                this.tenseMap[tense].attr('disabled', false);
            }
        },

        randomTense: function() {
            var applicableTenses = can.Map.keys(this.tenseMap).filter(function(tense) { return !this.tenseMap[tense].disabled; }, this);
            return can.fixture.rand(applicableTenses, 1)[0];
        },

        randomSubject: function(tense) {
            return can.fixture.rand(this.tenseMap[tense], 1)[0];
        }
    });

    return Quiz;
});