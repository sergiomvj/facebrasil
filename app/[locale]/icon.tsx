
import { ImageResponse } from 'next/og';

// Dimensions of the icon
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Force the icon to be cacheable
export const runtime = 'edge';

export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F97316', // Orange-500 equivalent
                }}
            >
                <svg fill="currentColor" viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"></path>
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
