// src/components/ui/accordion.jsx
import { useState } from 'react';

const Accordion = ({ children, type = "multiple" }) => {
  return (
    <div className="space-y-2">
      {children}
    </div>
  );
};

const AccordionItem = ({ children, value }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg" data-state={isOpen ? "open" : "closed"}>
      {children}
    </div>
  );
};

const AccordionTrigger = ({ children, className = "" }) => {
  const handleClick = (e) => {
    const item = e.currentTarget.closest('[data-state]');
    if (item) {
      const newState = item.getAttribute('data-state') === 'open' ? 'closed' : 'open';
      item.setAttribute('data-state', newState);
    }
  };

  return (
    <button
      className={`flex justify-between w-full px-4 py-2 text-left hover:bg-gray-50 ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

const AccordionContent = ({ children, className = "" }) => {
  return (
    <div className={`px-4 pb-4 ${className}`}>
      {children}
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };