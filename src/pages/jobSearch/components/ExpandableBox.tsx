import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

interface ExpandableBoxProps {
  children: React.ReactNode;
  expandedContent: React.ReactNode;
  className?: string;
}

const ExpandableContext = createContext<{
  openId: string | null;
  setOpenId: (id: string | null) => void;
}>({ openId: null, setOpenId: () => {} });

let idCounter = 0;

const ExpandableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <ExpandableContext.Provider value={{ openId, setOpenId }}>
      {children}
    </ExpandableContext.Provider>
  );
};

const ExpandableBox: React.FC<ExpandableBoxProps> = ({
  children,
  expandedContent,
  className = '',
}) => {
  const [boxId] = useState(() => `box-${idCounter++}`);
  const { openId, setOpenId } = useContext(ExpandableContext);
  const isExpanded = openId === boxId;
  const [height, setHeight] = useState('0px');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setOpenId(isExpanded ? null : boxId);
  };

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isExpanded]);

  return (
    <div className={`cursor-pointer ${className}`}>
      <div onClick={handleToggle}>{children}</div>
      <div
        ref={contentRef}
        className={`transition-all duration-300 overflow-hidden`}
        style={{ height }}
      >
        <div className="px-4 pb-4 pt-2">{expandedContent}</div>
      </div>
    </div>
  );
};

export { ExpandableBox, ExpandableProvider };
