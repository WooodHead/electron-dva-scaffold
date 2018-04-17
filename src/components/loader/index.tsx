// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import classNames from 'classnames';
import * as styles from './index.less';

interface LoaderProps {
    spinning?: boolean;
    fullScreen?: boolean;
}

export default ({ spinning, fullScreen }: LoaderProps) => {
    return (
        <div className={classNames(styles.loader, {
            [styles.hidden]: !spinning,
            [styles.fullScreen]: fullScreen,
        })}
        >
            <div className={styles.warpper}>
                <div className={styles.inner} />
                <div className={styles.text} >LOADING</div>
            </div>
        </div>
    );
};