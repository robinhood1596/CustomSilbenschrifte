var SyllableConverter = function( configuration ) {

	const defaultTextSplitterRegex = /(?<Word>[\wüäöÜÄÖßẞ]+)|(?<Other>\s|[^\wüäöÜÄÖßẞ]+)/g;

	
	var m_hyphenator = configuration.hyphenator;
	var m_hyphenatorSeparator = configuration.hyphenatorSeparator ? configuration.hyphenatorSeparator : '•';
	var m_exceptionSeparator = configuration.exceptionSeparator ? configuration.exceptionSeparator : ' ';
	var m_textDecorator = configuration.textDecorator ? configuration.textDecorator : this;
	var m_textSplitterRegex = configuration.textSplitterRegex ? configuration.textSplitterRegex : defaultTextSplitterRegex;

	var m_syllableColors = configuration.syllableColors ? configuration.syllableColors : [ "blue", "red" ];
	var m_otherColor = configuration.otherColor ? configuration.otherColor : "black";

	var m_wordCount = 0;

	var m_exceptionsMap = new Map();


	separateSyllables = function(wordToSplit) {
 
		let syllableword = "";
		let sourceposition = 0;
		let exceptionPattern = m_exceptionsMap.get( wordToSplit.toLowerCase() );

		for (let i = 0; i < exceptionPattern.length; i++ ) {
			if ( exceptionPattern.charAt(i) === m_hyphenatorSeparator ) {
				syllableword = syllableword + m_hyphenatorSeparator
			}
			else {
				syllableword = syllableword + wordToSplit.charAt(sourceposition);

				sourceposition = sourceposition + 1;
			}
		}

		return syllableword;
	};


	this.setExceptions = function( exceptions ) {

		m_exceptionsMap.clear();

		exceptions.forEach( (exception) => {
			let key = exception.toLowerCase().split(m_exceptionSeparator).join("");
			let value = exception.toLowerCase().split(m_exceptionSeparator).join(m_hyphenatorSeparator);
			
			m_exceptionsMap.set(key,value);
		});
	};

	this.decorateWord = function( primarilyWord, syllables ) {
		
		let syllableCount = 0;
		let htmlChunk = "";
		
		syllables.forEach( (syllable) => {
			htmlChunk += '<font color="' + m_syllableColors[ syllableCount % m_syllableColors.length ] + '">' + syllable + '</font>';
			
			syllableCount++;
		} );
		
		return htmlChunk;
	};
	
	this.decorateOther = function( other ) {
		pattern = /[\n\r\s]+/;

		if (pattern.test(other))
		{
			return other;
		}
		else
		{
			return'<font color="' + m_otherColor + '">' + other + '</font>';
		}
	};
	
	this.setSyllableColors = function( colors = [ "red", "blue" ] ) {
		m_syllableColors = colors;
	};

	this.setOtherColor = function( color ) {
		m_otherColor = color;
	}

	this.convertText = function( text ) {
		
		let htmlChunk = "";
		m_wordCount = 0;
		
		for (const match of text.matchAll(m_textSplitterRegex)) {
			if ( typeof match.groups.Word !== 'undefined' ) {
				
				let currentWord = match.groups.Word;
				let separatedWord = "";
				
				if ( m_exceptionsMap.has( currentWord.toLowerCase() ) ) {
					separatedWord = separateSyllables( currentWord );
				}
				else {
					separatedWord = m_hyphenator( currentWord );
				}
				
				htmlChunk += m_textDecorator.decorateWord( currentWord, separatedWord.split( m_hyphenatorSeparator ) );
				m_wordCount++;
			}
			
			if ( typeof match.groups.Other !== 'undefined' ) {
				
				htmlChunk += m_textDecorator.decorateOther( match.groups.Other );
			}	
		}
		
		return htmlChunk;
	};
	
	this.getWordCount = function( ) {
		return m_wordCount;
	};

	this.setExceptions( configuration.exceptions ? configuration.exceptions : [] );
};