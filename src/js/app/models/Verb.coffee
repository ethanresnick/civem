define ["jquery", "app/can"], ($, can) ->
  Verb = can.Model.extend(
    validTenseSubjectsMap: (->
      subjects = ['io', 'tu', 'lui', 'noi', 'voi', 'loro']
      tenses = ['presente', 'passato prossimo', 'imperfetto', 'imperativo']
      res = {}

      (res[tense] = if tense is "imperativo" then ["tu", "lui", "noi", "voi"] else subjects.slice(0)) for tense in tenses
      res
    )()

    reflexivePronouns: {'io':'mi', 'tu':'ti', 'lui':'si', 'noi':'ci', 'voi':'vi', 'loro':'si'}

    conjugatorData: {
      irregularPastParticiples: {} #loaded dynamically from quizlet

      essereVerbsPassatoProssimo: [
        'partire', 'andare', 'uscire', 'rimanere', 'tornare', 'stare', 'entrare', 
        'arrivare', 'restare', 'venire', 'ritornare', 'salire', 'scendere',
        'nascere', 'crescere', 'diventare', 'morire', 'essere', 'cadere', 'esistere'
      ]

      irregularPresentVerbs: {
        'andare': {'io': 'vado', 'tu': 'vai', 'lui': 'va', 'loro':'vanno'}
        'uscire':  {'io': 'esco', 'tu': 'esci', 'lui': 'esce', 'loro':'escono'}
        'bere': {'io': 'bevo', 'tu': 'bevi', 'lui': 'beve', 'noi':'beviamo', 'voi':'bevete', 'loro':'bevono'}
        'essere': {'io': 'sono', 'tu': 'sei', 'lui': 'è', 'noi': 'siamo', 'voi':'siete', 'loro':'sono'}
        'avere':  {'io': 'ho', 'tu': 'hai', 'lui': 'ha', 'noi': 'abbiamo', 'loro':'hanno'}
        'fare': {'io':'faccio', 'tu':'fai', 'lui':'fa', 'noi':'facciamo', 'loro':'fanno'}
        'sapere': {'io':'so', 'tu':'sai', 'lui':'sa', 'noi':'sappiamo', 'loro':'sanno'}
        'volere': {'io':'voglio', 'tu':'vuoi', 'lui':'vuole', 'noi':'vogliamo', 'loro':'vogliono'}
        'potere': {'io':'posso', 'tu':'puoi', 'lui':'può', 'noi':'possiamo', 'loro':'possono'}
        'venire': {'io':'vengo', 'tu':'vieni', 'lui':'viene', 'loro':'vengono'}
        'rimanere': {'io':'rimango', 'loro':'rimango'}
        'dovere': {'io':'devo', 'tu':'devi', 'lui':'deve', 'noi':'dobbiamo', 'loro':'devono'}
        'dare': {'tu':'dai', 'lui':'dà', 'loro':'danno'}
        'dire': {'io':'dico', 'tu':'dici', 'lui': 'dice', 'noi':'diciamo', 'loro':'dicono'}
      }

      irregularImperfectVerbs: {
        'essere': {'io': 'ero', 'tu': 'eri', 'lui': 'era', 'noi': 'eravamo', 'voi': 'eravate', 'loro': 'erano'}
        'fare': {'io': 'facevo', 'tu': 'facevi', 'lui': 'faceva', 'noi': 'facevamo', 'voi': 'facevate', 'loro': 'facevano'}
        'dire': {'io': 'dicevo', 'tu': 'dicevi', 'lui': 'diceva', 'noi': 'dicevamo', 'voi': 'dicevate', 'loro': 'dicevano'}
        'bere': {'io': 'bevevo', 'tu': 'bevevi', 'lui': 'beveva', 'noi': 'bevevamo', 'voi': 'bevevate', 'loro': 'bevevano'}
      }

      irregularImperativeVerbs: {
        #@todo handle alternates
        'fare': {'lui': 'faccia'}
        'andare': {'lui':'vada'}
        'stare':{'lui':'stia'}
        'dire':{'lui':'dica'}
        'avere': {'lui':'abbi'}
        'essere': {'lui':'sii'}
      }

      iscPresentVerbs: []
    }

    conjugators:
      presente: (subject, infinitive, type, root, isReflexive) ->
        hasIBeforeEnding = (root.slice(-1) is "i")
        isGareOrCareVerb = (infinitive.slice(-4) in ["care", "gare"])
        irregulars = Verb.conjugatorData.irregularPresentVerbs
        endings = {
          'are': {'io':'o', 'tu':'i', 'lui':'a', 'noi':'iamo', 'voi':'ate', 'loro':'ano'}
          'ire': {'io':'o', 'tu':'i', 'lui':'e', 'noi':'iamo', 'voi':'ite', 'loro':'ono'}
          'ere': {'io':'o', 'tu':'i', 'lui':'e', 'noi':'iamo', 'voi':'ete', 'loro':'ono'}
        }

        if irregulars[infinitive]?[subject]? then return irregulars[infinitive][subject]

        if subject in ["tu", "noi"]
          if hasIBeforeEnding
            root = root.slice(0, -1)
          else if isGareOrCareVerb 
            root += "h"

        (if isReflexive then Verb.reflexivePronouns[subject] + " " else "") + root + endings[type][subject]

      "passato prossimo": (subject, infinitive, type, root, isReflexive) ->
        endings = {are: "at", ere: "ut", ire: "it"}
        useEssere = isReflexive or infinitive in Verb.conjugatorData.essereVerbsPassatoProssimo
        usePlural = useEssere and subject in ["noi", "voi", "loro"]
        irregulars = Verb.conjugatorData.irregularPastParticiples

        #Essere ending modification always assumes that it's masculine (just changes for sing/plural)
        auxilary = new Verb({infinitive: (if useEssere then "essere" else "avere")}).conjugate(subject, "presente")
        ending = endings[type] + (if usePlural then "i" else "o")
        pp = (if irregulars[infinitive] then irregulars[infinitive].slice(0, -1) + (if usePlural then "i" else "o") else root + ending)
        (if isReflexive then Verb.reflexivePronouns[subject] + " " else "") + auxilary + " " + pp

      imperfetto: (subject, infinitive, type, root, isReflexive) ->
        endings = {io: "vo", tu: "vi", lui: "va", noi: "vamo", voi: "vate", loro: "vano"}
        irregulars = Verb.conjugatorData.irregularImperfectVerbs

        if irregulars[infinitive]?[subject]? then return irregulars[infinitive][subject]

        (if isReflexive then Verb.reflexivePronouns[subject] + " " else "") + root + type.substr(0, 1) + endings[subject]

      imperativo: (subject, infinitive, type, root, isReflexive) ->
        irregulars = Verb.conjugatorData.irregularImperativeVerbs

        if irregulars[infinitive]?[subject]? then return irregulars[infinitive][subject]
        
        if subject is "tu" and type is "are"
          Verb.conjugators.presente "lui", infinitive, type, root, isReflexive
        
        else if subject is "lui" and type isnt "are"
          Verb.conjugators.presente("io", infinitive, type, root, isReflexive).slice(0, -1) + "a"
        
        else
          Verb.conjugators.presente subject, infinitive, type, root, isReflexive

    findAll: (params) ->
      deferred = jQuery.Deferred()
      setList = "26276551,27363215,31499674"
      irregulars = []
      $.getJSON "https://api.quizlet.com/2.0/sets?set_ids=" + setList + "&client_id=AEgzk2BXWu&callback=?", (data) ->
        $.each data[2].terms, (index, term) ->
          term.infinitive = term.term
          term.irregular = true
          delete term.term

          irregulars.push term

        $.each data[1].terms, (index, obj) ->
          Verb.conjugatorData.irregularPastParticiples[obj.definition.slice(0, -5)] = obj.term

        $.each data[0].terms, (index, term) ->
          term.infinitive = term.term
          delete term.term
          
          #the term has stuff at the end besides the verb, so remove it
          #@todo, preserve it in another property where necessary, and append
          #that to the end of all conjugated forms, e.g. esserci il sole, store
          #verb as esserci and keep the il sole part to append.
          if term.infinitive.slice(-3) not in ["are", "ere", "ire", "rsi"]
            @infinitive = @infinitive.replace(/(.*)(are|ere|ire|si)\b(.*)$/, "$1$2")
            
          if Verb.conjugatorData.irregularPastParticiples[term.infinitive]? or Verb.conjugatorData.irregularPresentVerbs[term.infinitive]? or Verb.conjugatorData.irregularImperfectVerbs[term.infinitive]? or Verb.conjugatorData.irregularImperativeVerbs[term.infinitive]?
            term.irregular = true
            irregulars.push term
          else
            term.irregular = false

        deferred.resolve(if params.irregular then irregulars else data[0].terms.concat(data[2].terms))

      deferred

    findBy: (property, matches, callback) ->
      res = new Verb.List([])
      @findAll({}).then((verbs) ->
        (res.push(verb) for verb in verbs when verb[property] in matches)
        res
      ).done(callback)
  ,
    init: (attributes) ->
      @infinitive = attributes.infinitive
      @isReflexive = @infinitive.slice(-2) is "si"
      @isCi = @infinitive.slice(-2) is "ci"
      @root = (if @isReflexive or @isCi then @infinitive.slice(0, -4) else @infinitive.slice(0, -3))
      @type = (if @isReflexive or @isCi then (@infinitive.slice(-4, -2) + "e") else @infinitive.slice(-3))

    conjugate: (subject, tense) ->
      tenseMap = Verb.validTenseSubjectsMap
      if not tenseMap[tense]?
        throw new Error("Invalid tense. Tense must be one of: " + Object.keys(tenseMap).join(", ") + ".")

      if not subject in tenseMap[tense]
        throw new Error("Invalid subject for the tense: " + tense + ". Subject must be one of: " + tenseMap[tense].join(", ") + ".")

      Verb.conjugators[tense] subject, @infinitive, @type, @root, @isReflexive
  )
  Verb

