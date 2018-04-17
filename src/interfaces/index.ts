import { RouteComponentProps } from 'react-router';
import { DispatchProp } from 'react-redux';

export type DvaComponentProps = DispatchProp<any> & { children?: React.ReactNode };
export type DvaRouteComponentProps<P = any> = RouteComponentProps<P> & DvaComponentProps;

export * from './user'; 