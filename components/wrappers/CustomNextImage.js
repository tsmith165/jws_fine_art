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
            <div className={styles.centered_image_container}>
                {this.state.isLoading && <div className={styles.spinner}></div>}

                <NextImage
                    className={styles.centered_image}
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
