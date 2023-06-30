import React, {useEffect, useState} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {ITeamOverview, IUserData} from 'types';

import useSWR from 'swr';
import {getData, getUserData} from '../api';

import Card from '../components/Card';
import {Container} from '../components/GlobalComponents';
import Header from '../components/Header';
import List from '../components/List';

const TeamOverview = () => {
    const location = useLocation();
    const {teamId} = useParams();

    const [isLoading, setIsLoading] = useState(true);

    const {data: teamOverview} = useSWR<ITeamOverview>(`teams/${teamId}`, getData);
    const {data: teamLead} = useSWR<IUserData>(() => `users/${teamOverview.teamLeadId}`, getData);
    const {data: teamMembers} = useSWR(
        () => teamOverview.teamMemberIds,
        async ids => Promise.all(ids.map(id => getUserData(id)))
    );

    useEffect(() => {
        if (teamMembers && teamMembers.length > 0) {
            setIsLoading(false);
        }
    }, [teamMembers]);

    const formatMembersToCards = (membersList: IUserData[]) => {
        if (membersList.length === 0) {
            return [];
        }

        return membersList.map(member => {
            const name = `${member.firstName} ${member.lastName} (${member.displayName})`;

            return {
                id: member.id,
                title: 'Team Member',
                navigateTo: `/user/${member.id}`,
                location: member.location,
                navigationProps: member,
                name,
            };
        });
    };

    const teamLeadCard = () => {
        const name = `${teamLead.firstName} ${teamLead.lastName} (${teamLead.displayName})`;

        return (
            <Card
                key={teamLead.id}
                id={teamLead.id}
                name={name}
                title="Team Lead"
                location={teamLead.location}
                navigateTo={`/user/${teamLead.id}`}
                navigationProps={teamLead}
            />
        );
    };

    return (
        <Container>
            <Header title={`Team ${location.state.name}`} />
            {!isLoading && teamLead && teamLeadCard()}
            <List items={formatMembersToCards(teamMembers ?? [])} isLoading={isLoading} />
        </Container>
    );
};

export default TeamOverview;
