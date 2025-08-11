import React, { useState } from 'react';

// Create context for tabs
const TabsContext = React.createContext();

export const Tabs = ({ defaultValue, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="w-full">
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className = '' }) => (
  <div className={`flex border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

export const TabsTrigger = ({ 
  value, 
  children,
  className = '' 
}) => (
  <TabsContext.Consumer>
    {({ activeTab, setActiveTab }) => (
      <button
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === value 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'
        } ${className}`}
        onClick={() => setActiveTab(value)}
      >
        {children}
      </button>
    )}
  </TabsContext.Consumer>
);

export const TabsContent = ({ 
  value, 
  children,
  className = '' 
}) => (
  <TabsContext.Consumer>
    {({ activeTab }) => (
      <div 
        className={`${className} ${activeTab === value ? 'block' : 'hidden'}`}
      >
        {children}
      </div>
    )}
  </TabsContext.Consumer>
);