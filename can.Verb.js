var Verb = can.Model.extend({
    validTenseSubjectsMap: (function() {
        var subjects = ['io', 'tu', 'lui', 'noi', 'voi', 'loro'],
            tenses = ['presente', 'passato prossimo', 'imperfetto', 'imperativo'],
            res = {},
            subjectsCopy;

            for(var i = 0, len = tenses.length; i < len; i++) {
                subjectsCopy = subjects.slice(0);
                if(tenses[i]=='imperativo') { subjectsCopy = ['tu', 'lui', 'noi', 'voi']; }
                res[tenses[i]] = subjectsCopy;
            }

        return res;
    }()),
    reflexivePronouns: {'io':'mi', 'tu':'ti', 'lui':'si', 'noi':'ci', 'voi':'vi', 'loro':'si'},
    conjugatorData: {
        irregularPastParticiples: {}, //loaded dynamically from quizlet
        essereVerbsPassatoProssimo: [
            'partire', 'andare', 'uscire', 'rimanere', 'tornare', 'stare', 'entrare', 
            'arrivare', 'restare', 'venire', 'ritornare', 'salire', 'scendere',
            'nascere', 'crescere', 'diventare', 'morire', 'essere', 'cadere'
        ],
        irregularPresentVerbs: {
            'andare': {'io': 'vado', 'tu': 'vai', 'lui': 'va', 'loro':'vanno'},
            'uscire':  {'io': 'esco', 'tu': 'esci', 'lui': 'esce', 'loro':'escono'},
            'bere': {'io': 'bevo', 'tu': 'bevi', 'lui': 'beve', 'noi':'beviamo', 'voi':'bevete', 'loro':'bevono'},
            'essere': {'io': 'sono', 'tu': 'sei', 'lui': 'è', 'noi': 'siamo', 'voi':'siete', 'loro':'sono'},
            'avere':  {'io': 'ho', 'tu': 'hai', 'lui': 'ha', 'noi': 'abbiamo', 'loro':'hanno'},
            'fare': {'io':'faccio', 'tu':'fai', 'lui':'fa', 'noi':'facciamo', 'loro':'fanno'},
            'sapere': {'io':'so', 'tu':'sai', 'lui':'sa', 'noi':'sappiamo', 'loro':'sanno'},
            'volere': {'io':'voglio', 'tu':'vuoi', 'lui':'vuole', 'noi':'vogliamo', 'loro':'vogliono'},
            'potere': {'io':'posso', 'tu':'puoi', 'lui':'può', 'noi':'possiamo', 'loro':'possono'},
            'venire': {'io':'vengo', 'tu':'vieni', 'lui':'viene', 'loro':'vengono'},
            'rimanere': {'io':'rimango', 'loro':'rimango'},
            'dovere': {'io':'devo', 'tu':'devi', 'lui':'deve', 'noi':'dobbiamo', 'loro':'devono'},
            'dare': {'tu':'dai', 'lui':'dà', 'loro':'danno'},
            'dire': {'io':'dico', 'tu':'dici', 'lui': 'dice', 'noi':'diciamo', 'loro':'dicono'}
        },
        irregularImperfectVerbs: {
            'essere': {'io': 'ero', 'tu': 'eri', 'lui': 'era', 'noi': 'eravamo', 'voi': 'eravate', 'loro': 'erano'},
            'fare': {'io': 'facevo', 'tu': 'facevi', 'lui': 'faceva', 'noi': 'facevamo', 'voi': 'facevate', 'loro': 'facevano'},
            'dire': {'io': 'dicevo', 'tu': 'dicevi', 'lui': 'diceva', 'noi': 'dicevamo', 'voi': 'dicevate', 'loro': 'dicevano'},
            'bere': {'io': 'bevevo', 'tu': 'bevevi', 'lui': 'beveva', 'noi': 'bevevamo', 'voi': 'bevevate', 'loro': 'bevevano'},
        },

        irregularImperativeVerbs: {
            //@todo handle alternates
            'fare': {'lui': 'faccia'},
            'andare': {'lui':'vada'},
            'stare':{'lui':'stia'},
            'dire':{'lui':'dica'},
            'avere': {'lui':'abbi'},
            'essere': {'lui':'sii'}
        },

        iscPresentVerbs: []
    },
    conjugators: {
        'presente': function(subject, infinitive, type, root, isReflexive) {
            var hasIBeforeEnding = (root.slice(-1) == 'i'),
                isGareOrCareVerb = (infinitive.slice(-4)=='care' || infinitive.slice(-4)=='gare'),
                irregulars = Verb.conjugatorData.irregularPresentVerbs,
                endings = {
                    'are': {'io':'o', 'tu':'i', 'lui':'a', 'noi':'iamo', 'voi':'ate', 'loro':'ano'},
                    'ire': {'io':'o', 'tu':'i', 'lui':'e', 'noi':'iamo', 'voi':'ite', 'loro':'ono'},
                    'ere': {'io':'o', 'tu':'i', 'lui':'e', 'noi':'iamo', 'voi':'ete', 'loro':'ono'}
                };
    
            if(irregulars[infinitive]!==undefined && irregulars[infinitive][subject]!==undefined) {
                return irregulars[infinitive][subject];
            }

            if(subject=="tu" || subject=="noi") {
                if(hasIBeforeEnding) {
                    root = root.slice(0,-1);
                }
                else if(isGareOrCareVerb) {
                    root = root + "h"
                }
            }
                
            return (isReflexive ? Verb.reflexivePronouns[subject] + ' ' : '') + root + endings[type][subject];
        },

        'passato prossimo': function(subject, infinitive, type, root, isReflexive) {
            var endings = {'are':'at', 'ere':'ut', 'ire':'it'},
                useEssere = isReflexive || Verb.conjugatorData.essereVerbsPassatoProssimo.indexOf(infinitive)!==-1,
                usePlural = useEssere && ['noi','voi','loro'].indexOf(subject)!==-1,
                irregulars = Verb.conjugatorData.irregularPastParticiples,
                auxilary, ending, pp;

            //Essere ending modification always assumes that it's masculine (just changes for sing/plural)
            auxilary = new Verb(useEssere ? {'infinitive':'essere'} : {'infinitive':'avere'}).conjugate(subject, 'presente'); 
            ending = endings[type] + (usePlural ? 'i' : 'o');
            pp = irregulars[infinitive] ? irregulars[infinitive].slice(0,-1) + (usePlural ? 'i' : 'o') : root + ending;

            return (isReflexive ? Verb.reflexivePronouns[subject] + ' ' : '') + auxilary + ' ' + pp;
        },

        imperfetto: function(subject, infinitive, type, root, isReflexive) {
            var endings = {'io':'vo', 'tu':'vi', 'lui':'va', 'noi':'vamo', 'voi':'vate', 'loro':'vano'},
                irregulars = Verb.conjugatorData.irregularImperfectVerbs;

            if(irregulars[infinitive]!==undefined && irregulars[infinitive][subject]!==undefined) {
                return irregulars[infinitive][subject];
            }

            return (isReflexive ? Verb.reflexivePronouns[subject] + ' ' : '') + root + type.substr(0,1) + endings[subject];
        },

        imperativo: function(subject, infinitive, type, root, isReflexive) {
            var irregulars = Verb.conjugatorData.irregularImperativeVerbs;

            if(irregulars[infinitive]!==undefined && irregulars[infinitive][subject]!==undefined) {
                return irregulars[infinitive][subject];
            }
            if(subject=='tu' && type=='are') {
                return Verb.conjugators.presente('lui', infinitive, type, root, isReflexive);
            }
            else if(subject=='lui' && type!=='are') {
                return (Verb.conjugators.presente('io', infinitive, type, root, isReflexive).slice(0, -1) + 'a');
            }
            else {
                return Verb.conjugators.presente(subject, infinitive, type, root, isReflexive);
            }
        }
    },

    'findAll': function(params) {
        var deferred = jQuery.Deferred();
        var setList = "26276551,27363215";
        var irregulars = [];

        J50Npi.getJSON("https://api.quizlet.com/2.0/sets?set_ids=" + setList + "&client_id=AEgzk2BXWu", {}, function(data) { 
            $.each(data[1].terms, function(index, obj) {
                Verb.conjugatorData.irregularPastParticiples[obj.definition.slice(0,-5)] = obj.term;
            });

            $.each(data[0].terms, function(index, term) {
                term.infinitive = term.term;
                delete term.term;

                //the term has stuff at the end besides the verb, so remove it
                //@todo, preserve it in another property where necessary, and append
                //that to the end of all conjugated forms, e.g. esserci il sole, store
                //verb as esserci and keep the il sole part to append.
                if(['are','ere','ire', 'rsi'].indexOf(term.infinitive.slice(-3))===-1) {
                    this.infinitive = this.infinitive.replace(/(.*)(are|ere|ire|si)\b(.*)$/, "$1$2");
                }

                if(Verb.conjugatorData.irregularPastParticiples[term.infinitive]!==undefined ||
                   Verb.conjugatorData.irregularPresentVerbs[term.infinitive]!==undefined ||
                   Verb.conjugatorData.irregularImperfectVerbs[term.infinitive]!==undefined ||
                   Verb.conjugatorData.irregularImperativeVerbs[term.infinitive]!==undefined) {
                    term.irregular = true;
                    irregulars.push(term);
                }
                else {
                    term.irregular = false;
                }
            });

            deferred.resolve(params.irregular ? irregulars : data[0].terms);
        });
        return deferred;
    }
}, {
    init: function(attributes) {
        this.infinitive = attributes.infinitive;
        this.isReflexive = this.infinitive.slice(-2)=='si';
        this.isCi = this.infinitive.slice(-2)=='ci';
        this.root = this.isReflexive || this.isCi ? this.infinitive.slice(0, -4) : this.infinitive.slice(0, -3);
        this.type = this.isReflexive || this.isCi ? (this.infinitive.slice(-4, -2)+'e') : this.infinitive.slice(-3);
    },

    'conjugate': function(subject, tense) {    
        var tenseMap = Verb.validTenseSubjectsMap;     

        if(tenseMap[tense]===undefined) {
            throw new Error("Invalid tense. Tense must be one of: " + Object.keys(tenseMap).join(', ') + '.');
        }

        if(tenseMap[tense].indexOf(subject)===-1) {
            throw new Error("Invalid subject for the tense: " + tense + ". Subject must be one of: " + tenseMap[tense].join(', ') + '.');
        }
            
        return Verb.conjugators[tense](subject, this.infinitive, this.type, this.root, this.isReflexive);
    }
});