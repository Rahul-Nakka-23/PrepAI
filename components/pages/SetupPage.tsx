import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import type { InterviewType } from '../../types';

const interviewTypes: { id: InterviewType; label: string }[] = [
    { id: 'behavioral', label: 'Behavioral' },
    { id: 'technical', label: 'Technical' },
];

const SetupPage: React.FC = () => {
  const { login } = useContext(AppContext);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<InterviewType[]>([]);

  const handleCheckboxChange = (type: InterviewType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const canStart = name.trim() !== '' && goal.trim() !== '' && selectedTypes.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canStart) {
      login(name, goal, selectedTypes);
    }
  };

  return (
    <div className="flex items-center justify-center pt-16">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-center mb-6">Let's Get Started</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                What's your name?
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jane Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-text-secondary mb-2">
                What's your goal?
              </label>
              <Input
                id="goal"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Senior React Developer at a startup"
                required
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                    Select interview rounds
                </label>
                <div className="flex items-center space-x-4 rounded-md bg-secondary p-3">
                    {interviewTypes.map(({ id, label }) => (
                        <label key={id} className="flex items-center space-x-2 text-text-primary cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedTypes.includes(id)}
                                onChange={() => handleCheckboxChange(id)}
                                className="h-5 w-5 rounded bg-primary border-gray-600 text-accent focus:ring-accent focus:ring-offset-secondary"
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            </div>
          </div>
          <Button type="submit" disabled={!canStart} className="w-full mt-8" size="lg">
            Start Mock Interview
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SetupPage;