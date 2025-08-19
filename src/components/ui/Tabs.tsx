import React from "react";

export interface TabPaneProps {
  tab: React.ReactNode;
  key: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (activeKey: string) => void;
  children?: React.ReactNode;
  items?: Array<{
    key: string;
    label: string;
    children?: React.ReactNode;
    disabled?: boolean;
  }>;
  className?: string;
  style?: React.CSSProperties;
}

const TabPane: React.FC<TabPaneProps> = ({ children }) => {
  return <div>{children}</div>;
};

const Tabs: React.FC<TabsProps> = ({
  activeKey,
  defaultActiveKey,
  onChange,
  children,
  items,
  className = "",
  style,
}) => {
  const [currentActiveKey, setCurrentActiveKey] = React.useState(
    activeKey ?? defaultActiveKey,
  );

  React.useEffect(() => {
    if (activeKey !== undefined) {
      setCurrentActiveKey(activeKey);
    }
  }, [activeKey]);

  const handleTabClick = (key: string) => {
    setCurrentActiveKey(key);
    onChange?.(key);
  };

  // Handle items prop
  const tabItems = items || [];
  const tabPanes = children
    ? React.Children.toArray(children).filter(
        (child): child is React.ReactElement<TabPaneProps> =>
          React.isValidElement(child) && child.type === TabPane,
      )
    : [];

  const activePane =
    tabPanes.find((pane) => pane.key === currentActiveKey) || tabPanes[0];
  const activeItem =
    tabItems.find((item) => item.key === currentActiveKey) || tabItems[0];

  return (
    <div className={`tabs ${className}`} style={style}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 mb-4 py-1">
        {(items ? tabItems : tabPanes).map((item) => {
          const isActive = item.key === currentActiveKey;
          const isDisabled =
            "disabled" in item ? item.disabled : item.props?.disabled;
          const label = "label" in item ? item.label : item.props?.tab;

          return (
            <button
              key={item.key}
              onClick={() => !isDisabled && handleTabClick(item.key)}
              disabled={isDisabled}
              className={`px-4 py-2 text-base font-medium border-b-2 transition-all duration-200 ${
                isActive
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {items ? activeItem?.children : activePane?.props.children}
      </div>
    </div>
  );
};

export { Tabs, TabPane };
