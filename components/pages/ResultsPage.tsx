import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { aiService } from '../../services';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { RoadmapItemCard } from './DashboardPage';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-text-secondary">Analyzing your interview and generating your roadmap...</p>
    </div>
);

const ResultsPage: React.FC = () => {
    const { user, transcript, evaluation, setEvaluation, roadmap, setRoadmap, toggleTodo, setPage } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchResults = async () => {
        if (!user || transcript.length === 0) {
            setError("No interview data found. Please start a new interview.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            const evalResult = await aiService.generateEvaluation(transcript, user.goal);
            setEvaluation(evalResult);

            const roadmapResult = await aiService.generateRoadmap(evalResult.level, user.goal);
            setRoadmap(roadmapResult);

        } catch (err) {
            console.error("Failed to generate results:", err);
            setError("Sorry, there was an error generating your results. Please try again later.");
        } finally {
            setIsLoading(false);
        }
      };
      
      if (!evaluation) {
          fetchResults();
      } else {
          setIsLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, transcript]);

    if (isLoading) {
      return <Card className="mt-8"><LoadingSpinner /></Card>;
    }

    if (error) {
      return <Card className="mt-8 text-center text-red-400">{error}</Card>;
    }

    if (!evaluation) return null;

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Beginner': return 'text-yellow-400';
            case 'Intermediate': return 'text-blue-400';
            case 'Advanced': return 'text-green-400';
            default: return 'text-text-primary';
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold">Your Interview Results</h1>
                <p className="text-text-secondary mt-2">Here's a breakdown of your performance and your personalized path forward.</p>
            </div>

            <Card>
                <h2 className="text-2xl font-bold mb-4">Evaluation Summary</h2>
                <div className="space-y-6">
                    <div className="bg-primary p-4 rounded-lg border border-gray-700">
                        <h3 className="font-bold text-accent mb-2">Overall Level: <span className={getLevelColor(evaluation.level)}>{evaluation.level}</span></h3>
                        <p className="text-text-secondary">{evaluation.summary}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-primary p-4 rounded-lg border border-gray-700">
                            <h3 className="font-bold text-accent mb-2">Knowledge</h3>
                            <p className="text-text-secondary">{evaluation.knowledge}</p>
                        </div>
                        <div className="bg-primary p-4 rounded-lg border border-gray-700">
                            <h3 className="font-bold text-accent mb-2">Skills</h3>
                            <p className="text-text-secondary">{evaluation.skills}</p>
                        </div>
                         <div className="bg-primary p-4 rounded-lg border border-gray-700">
                            <h3 className="font-bold text-accent mb-2">Confidence</h3>
                            <p className="text-text-secondary">{evaluation.confidence}</p>
                        </div>
                         <div className="bg-primary p-4 rounded-lg border border-gray-700">
                            <h3 className="font-bold text-accent mb-2">Communication</h3>
                            <p className="text-text-secondary">{evaluation.communication}</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-2xl font-bold mb-4">Your Personalized Roadmap</h2>
                <div className="space-y-4">
                    {roadmap.map((item) => (
                        <RoadmapItemCard key={item.id} item={item} onToggle={toggleTodo} />
                    ))}
                </div>
            </Card>
            
            <div className="text-center">
                <Button onClick={() => setPage('dashboard')} size="lg">Go to Dashboard</Button>
            </div>
        </div>
    );
};

export default ResultsPage;
