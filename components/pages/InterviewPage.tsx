import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { AppContext } from '../../context/AppContext';
import { useSpeech } from '../../hooks/useSpeech';
import { aiService } from '../../services';
import Button from '../ui/Button';
import MicIcon from '../icons/MicIcon';

const InterviewPage: React.FC = () => {
  const { user, interviewTypes, transcript, addMessageToTranscript, setPage } = useContext(AppContext);
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'thinking' | 'finished'>('thinking');
  const [currentAiResponse, setCurrentAiResponse] = useState('');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const handleSpeechResult = useCallback((text: string) => {
    addMessageToTranscript({ speaker: 'user', text });
    setStatus('thinking');
  }, [addMessageToTranscript]);

  const { isListening, isSpeaking, startListening, stopListening, speak } = useSpeech(handleSpeechResult);
  
  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(scrollToBottom, [transcript, currentAiResponse]);
  
  const processStream = useCallback(async (stream: AsyncGenerator<string>) => {
    let fullText = "";
    for await (const chunkText of stream) {
        fullText += chunkText;
        setCurrentAiResponse(fullText);
    }
    return fullText;
  }, []);

  const getNextAiMessage = useCallback(async (message: string) => {
    try {
      const stream = await aiService.streamNextQuestion(message);
      const fullText = await processStream(stream);
      addMessageToTranscript({ speaker: 'ai', text: fullText });
      setCurrentAiResponse('');
      setStatus('speaking');
      speak(fullText, () => setStatus('idle'));
    } catch (error) {
      console.error("Error getting next AI message:", error);
      const errorMessage = "I'm sorry, I encountered an error. Let's try that again.";
      addMessageToTranscript({ speaker: 'ai', text: errorMessage });
      speak(errorMessage, () => setStatus('idle'));
    }
  }, [addMessageToTranscript, processStream, speak]);

  useEffect(() => {
    if (user && transcript.length === 0 && interviewTypes.length > 0) {
      aiService.startInterviewChat(user.goal, interviewTypes);
      getNextAiMessage("Start the interview.");
    }
  }, [user, transcript.length, getNextAiMessage, interviewTypes]);
  
  useEffect(() => {
    if (status === 'thinking' && transcript.length > 0 && transcript[transcript.length-1].speaker === 'user') {
      const lastUserMessage = transcript[transcript.length-1].text;
      getNextAiMessage(lastUserMessage);
    }
  }, [status, transcript, getNextAiMessage]);


  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFinishInterview = () => {
    setStatus('finished');
    setPage('results');
  };

  const interviewTitle = interviewTypes.length > 0 
    ? interviewTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' & ') + ' Interview'
    : 'Interview';

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">{interviewTitle} for: <span className="text-accent">{user?.goal}</span></h2>
      
      <div className="flex-grow bg-secondary rounded-lg p-4 overflow-y-auto mb-4 border border-gray-700">
        {transcript.map((msg, index) => (
          <div key={index} className={`flex mb-4 ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.speaker === 'user' ? 'bg-accent text-white' : 'bg-gray-700 text-text-primary'}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {currentAiResponse && (
           <div className="flex mb-4 justify-start">
            <div className="rounded-lg px-4 py-2 max-w-sm bg-gray-700 text-text-primary">
              <p>{currentAiResponse}<span className="inline-block w-1 h-4 bg-white ml-1 animate-ping"></span></p>
            </div>
          </div>
        )}
        <div ref={transcriptEndRef} />
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
         <p className="text-text-secondary h-6">
            {isListening && "Listening..."}
            {isSpeaking && "AI is speaking..."}
            {status === 'thinking' && "AI is thinking..."}
        </p>
        <div className="flex items-center space-x-4">
            <button
                onClick={handleMicClick}
                disabled={isSpeaking || status === 'thinking'}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors
                    ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-accent hover:bg-accent-hover'}
                    disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
                <MicIcon className="w-8 h-8 text-white" />
            </button>
            <Button onClick={handleFinishInterview} variant="secondary" disabled={transcript.length < 2}>
                Finish Interview
            </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
