import React, { useState, useEffect } from 'react';
import './Elements.css'; // Create a separate CSS file for styling

const WordAnimation = ({ text }) => {
    const [words, setWords] = useState([]);

    useEffect(() => {
      const wordArray = text? text.split(' '): [];
      setWords(wordArray);
    }, [text]);
  
    return (
      <div className="word-animation">
        {words.map((word, index) => (
            
          <React.Fragment key={index}>
          
            <span className={`word-${index}`}>
              {word.split('').map((char, charIndex) => (
                <span key={charIndex} className="char">
                  {char}
                </span>
              ))}
            </span>
            {' '} {/* Add a space element between words */}
          </React.Fragment>
 
        ))}
      </div>
    );
  };
  
  export default WordAnimation;