import { Camera, Phone } from 'amazon-chime-sdk-component-library-react';
import { ReactNode } from 'react';

import './VideoPlaceholder.css';

export default function VideoPlaceholder({
  title,
  icons = ['Camera'],
}: {
  title?: string;
  icons?: ('Camera' | 'Phone')[];
}) {
  return (
    <div className="VideoPlaceholder">
      <div>
        {icons.map((icon, index) => {
          let iconNode: ReactNode;
          switch (icon) {
            case 'Camera':
              iconNode = <Camera key={index} disabled={true} width="2rem" height="2rem" color="white" />;
              break;
            case 'Phone':
              iconNode = <Phone key={index} width="2rem" height="2rem" color="white" />;
              break;
          }
          return iconNode;
        })}
      </div>
      {title && <div className="VideoPlaceholder__title">{title}</div>}
    </div>
  );
}
