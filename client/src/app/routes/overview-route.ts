import {lazy} from 'src/app/utils';

import {Routes} from '../services';
import {OverviewAuthGuard, OrganizationEditGuard} from '../guards';

const OverviewCenter = lazy(import('../pages/overview'), 'OverviewPage');
const OverviewOrganization = lazy(
  import('../pages/overview'),
  'OverviewOrganization',
);
const OverviewOrganizationEdit = lazy(
  import('../pages/overview'),
  'OrganizationEditPage',
);
const OverviewDocs = lazy(import('../pages/overview'), 'OverviewDocs');

export const OverviewRoutes: Routes = [
  {
    path: '/overview',
    layout: 'no-footer',
    component: OverviewCenter,
    redirect: '/overview/organization',
    activatedGuard: [OverviewAuthGuard],
    children: [
      {
        path: '/organization',
        isNest: true,
        component: OverviewOrganization,
      },
      {
        path: '/organization/edit/:id',
        isNest: true,
        component: OverviewOrganizationEdit,
        activatedGuard: [OrganizationEditGuard],
      },
      {
        path: '/organization/docs/:id',
        isNest: true,
        component: OverviewDocs,
      },
    ],
  },
];
