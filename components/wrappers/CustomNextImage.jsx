import React from 'react';
import NextImage from 'next/image';

class CustomNextImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: true };
    }

    handleImageLoad = () => {
        this.setState({ isLoading: false });
    }

    render() {
        const { src, alt, width, height, quality, hidden=false } = this.props;
        return (
            <div className={'flex w-full h-full justify-center items-center'}>
                {this.state.isLoading && !hidden && (
                    <div className={'flex justify-center items-center absolute inset-0'}>
                        <div className={'box-border border-8 border-primary rounded-[75%] border-t-8 border-t-light animate-spin w-16 h-16'}></div>
                    </div>
                )}

                <NextImage
                    className={'max-h-full max-w-full object-contain'}
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
}

export default CustomNextImage;

