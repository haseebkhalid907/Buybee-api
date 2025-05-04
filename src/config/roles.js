// const allRoles = {
//   user: [],
//   admin: ['getUsers', 'manageUsers'],
// };

// const roles = Object.keys(allRoles);
// const roleRights = new Map(Object.entries(allRoles));

// module.exports = {
//   roles,
//   roleRights,
// };


const subjects = {
  profile: 'profile',
  user: 'user',
  product: 'product',
  order: 'order',
  all: 'all',
};
const actions = {
  read: 'read',
  readAll: 'readAll',
  create: 'create',
  manage: 'manage',
  update: 'update',
  delete: 'delete',
};
const allRoles = {
  user: [
    // user access
    {
      action: actions.read,
      subject: subjects.user,
    },
    // {
    //   action: actions.readAll,
    //   subject: subjects.user,
    // },
    // //
    // {
    //   action: actions.manage,
    //   subject: subjects.all,
    // },
    {
      action: actions.create,
      subject: subjects.user,
    },
    {
      action: actions.update,
      subject: subjects.user,
    },
    {
      action: actions.delete,
      subject: subjects.user,
    },
    {
      action: actions.read,
      subject: subjects.product,
    },
    {
      action: actions.create,
      subject: subjects.product,
    },
    {
      action: actions.update,
      subject: subjects.product,
    },
    {
      action: actions.delete,
      subject: subjects.product,
    },

    // order roles
    {
      action: actions.read,
      subject: subjects.order,
    },
    {
      action: actions.create,
      subject: subjects.order,
    },
    {
      action: actions.update,
      subject: subjects.order,
    },
    {
      action: actions.delete,
      subject: subjects.order,
    }


  ],
  admin: [
    {
      action: actions.manage,
      subject: subjects.all,
    },
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
  subjects,
  actions,
};
