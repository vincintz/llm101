import React, { useState } from 'react'
import GenerateStepHeader from '../GenerateStepHeader'
import GenerateStepBody from '../GenerateStepBody';

function GenerateContentStep() {
  const [canGenerateContent] = useState(false);

  const startGeneration = () => {
    console.log("starting to generate");
  };

  return (
    <div>
      <GenerateStepHeader
        canGenerateContent={canGenerateContent}
        startGeneration={startGeneration}
      />
      <GenerateStepBody
      />
    </div>
  )
}

export default GenerateContentStep
