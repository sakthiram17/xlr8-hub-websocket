import React, { useState } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const EquationParser = (props) => {
  // Regular expression to identify equations in the text
  const equationRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
  let text = props.text;
  const parts = text ? text.split(equationRegex) : [];

  
  // Split the text into parts with and without equations
  const renderParts = parts.map((part, index) => {
    // Check if the part is an equation
    if (part.match(equationRegex)) {
      return (
        <div key={index}>
          <MathJax>{part}</MathJax>
          <br />
        </div>
      );
    }

  
    // Replace double asterisks with bold tags
    const withBoldTags = part.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Replace newlines with <br> tags
    const withLineBreaks = withBoldTags.replace(/\n/g, '<br>');

    // Replace tabs with HTML entity equivalent
    const withTabsReplaced = withLineBreaks.replace(/\t/g, '&#9;');

    // Render the modified text
    return <div key={index} dangerouslySetInnerHTML={{ __html: withTabsReplaced }} />;
  });
  let display = props.show?'flex-box':'none';
  return <div className={display}><MathJaxContext>{renderParts}</MathJaxContext></div>;
};

export default EquationParser;