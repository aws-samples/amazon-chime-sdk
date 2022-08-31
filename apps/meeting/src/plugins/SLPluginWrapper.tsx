// This plugin wrapper will provide some common functions which will be available to all the plugins
// The common functions can be simply passed as props in the returning component and be used there

import React from 'react'

const slPluginWrapper = (SLPluginComponent: React.FC): React.FC => {

    // Write the common functions here and include them in propsToReturn
    const someFunction = () => {
        alert("Hello world!");
    }

    const ComponentWrapper = function (props: any): JSX.Element {
        const propsToReturn = {
            ...props,
            someFunction,
        }
        return <SLPluginComponent {...propsToReturn} />;
    };

    return ComponentWrapper;
}

export default slPluginWrapper