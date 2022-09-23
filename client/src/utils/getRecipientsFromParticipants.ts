export default (participants: any[], userId: any) => {
    return participants.filter((participant) => participant._id !== userId);
};
