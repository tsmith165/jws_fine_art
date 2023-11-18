import React from 'react';
import NextImage from 'next/image';

import styles from '@/styles/components/CustomNextImage.module.scss';

class CustomNextImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: true };
    }

    handleImageLoad = () => {
        this.setState({ isLoading: false });
    }

    render() {
        const { src, alt, width, height, quality } = this.props;
        return (
            <div className={'flex w-auto h-auto justify-center'}>
                {this.state.isLoading && <div className={styles.spinner}></div>}

                <NextImage
                    className={'mx-auto w-fit'}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    quality={quality}
                    onLoad={this.handleImageLoad}
                    unoptimized={true}
                />
            </div>
        );
    }
};

export default CustomNextImage;
