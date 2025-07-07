import { cn } from '../../lib/utils';

function Skeleton(props) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', props.className)}
      {...props}
    />
  );
}

export { Skeleton };
