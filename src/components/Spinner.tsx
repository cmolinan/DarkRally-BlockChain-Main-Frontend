import clsx from 'clsx';
import React from 'react';

interface IProps {
  color: string;
}

export const Spinner = ({ color }: IProps) => {
  return (
    <svg className={clsx('spinner', color)} viewBox='0 0 50 50'>
      <circle
        className='path'
        cx='25'
        cy='25'
        r='20'
        fill='none'
        stroke-width='5'
      ></circle>
    </svg>
  );
};
