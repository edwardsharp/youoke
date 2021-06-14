import React from 'react'
import { Story, Meta } from '@storybook/react'
import Landing, { LandingProps } from '../pages/Landing'
import { IRoom } from '../pages/Room'

export default {
    title: 'Example/Landing',
    component: Landing,
} as Meta

const Template: Story<LandingProps> = (args) => <Landing {...args} />

export const LandingExample = Template.bind({})
LandingExample.args = {
    setRoom: (room: IRoom) => {},
}

// const Template: Story<HeaderProps> = (args) => <Header {...args} />;

// export const LoggedIn = Template.bind({});
// LoggedIn.args = {
//   user: {},
// };

// const [roomList, setRoomList] = useState(['LOCALHOST'])
//     const [room, setRoom] = useState<string>()
