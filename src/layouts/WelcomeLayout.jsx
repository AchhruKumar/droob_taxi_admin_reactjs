import React from 'react'
import AuthImage from '@/assets/auth-image.svg';
import Logo from '@/assets/droob-logo.svg';

const WelcomeLayout = ({ children, ...props }) => {
    return (
        <section className="min-h-screen flex items-center justify-center py-12">
            <div className="container">
                <div className="flex gap-[140px]">
                    <div className="dash-image">
                        <img src={AuthImage} alt="Login" className='md:sticky md:top-[50px] md:min-h-[calc(100vh_-_100px)]' />
                    </div>
                    <div className="dash-form w-full self-center max-w-[400px]">
                        {props && (
                            <>
                                <img src={props.logo ? props.logo : Logo} className='mx-auto mb-12' alt="Logo" />
                                <h2 className='text-2xl font-medium text-center mb-10'>{props.title}</h2>
                            </>
                        )}
                        {children}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default WelcomeLayout
