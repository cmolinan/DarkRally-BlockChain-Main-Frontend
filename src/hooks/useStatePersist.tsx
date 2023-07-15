import React from 'react';

export const useStatePersist = (name: string, defaultValue: any) => {
  const [value, setValue] = React.useState(defaultValue);
  const nameRef = React.useRef(name);

  React.useEffect(() => {
    try {
      const storedValue = localStorage.getItem(name);
      if (storedValue !== null) setValue(storedValue);
      else localStorage.setItem(name, defaultValue);
    } catch {
      setValue(defaultValue);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(nameRef.current, value);
    } catch (err) {
      console.log(err);
    }
  }, [value]);

  React.useEffect(() => {
    const lastName = nameRef.current;
    if (name !== lastName) {
      try {
        localStorage.setItem(name, value);
        nameRef.current = name;
        localStorage.removeItem(lastName);
      } catch (err) {
        console.log(err);
      }
    }
  }, [name]);

  return [value, setValue];
};
