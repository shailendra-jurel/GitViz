// src/components/ui/card.jsx
const Card = ({ children, className = "" }) => {
    return (
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
        {children}
      </div>
    );
  };
  
  const CardHeader = ({ children, className = "" }) => {
    return (
      <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
        {children}
      </div>
    );
  };
  
  const CardTitle = ({ children, className = "" }) => {
    return (
      <h3 className={`text-xl font-semibold ${className}`}>
        {children}
      </h3>
    );
  };
  
  const CardContent = ({ children, className = "" }) => {
    return (
      <div className={`p-6 ${className}`}>
        {children}
      </div>
    );
  };
  
  export { Card, CardHeader, CardTitle, CardContent };