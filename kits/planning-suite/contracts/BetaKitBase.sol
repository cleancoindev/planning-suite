pragma solidity 0.4.24;

import "@aragon/os/contracts/factory/DAOFactory.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

import "@aragon/id/contracts/IFIFSResolvingRegistrar.sol";

import "@aragon/apps-voting/contracts/Voting.sol";
import "@aragon/apps-vault/contracts/Vault.sol";
import { TokenManager } from "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-finance/contracts/Finance.sol";

import "@tps/test-helpers/contracts/lib/bounties/StandardBounties.sol";

import "@tps/apps-address-book/contracts/AddressBook.sol";
import "@tps/apps-allocations/contracts/Allocations.sol";
import "@tps/apps-projects/contracts/Projects.sol";
import { RangeVoting } from "@tps/apps-range-voting/contracts/RangeVoting.sol";


import "@aragon/os/contracts/common/IsContract.sol";

import "@aragon/kits-base/contracts/KitBase.sol";


contract BetaKitBase is KitBase, IsContract {
    StandardBounties public registry;
    MiniMeTokenFactory public minimeFac;
    IFIFSResolvingRegistrar public aragonID;
    bytes32[4] public appIds;
    bytes32[4] public planningAppIds;
    uint256 constant PCT256 = 10 ** 16;
    uint64 constant PCT64 = 10 ** 16;
    address constant ANY_ENTITY = address(-1);

    mapping (address => address) tokenCache;

    // ensure alphabetic order
    enum Apps { Finance, TokenManager, Vault, Voting }
    enum PlanningApps { AddressBook, Allocations, Projects, RangeVoting } 

    event DeployToken(address token, address indexed cacheOwner);
    event DeployInstance(address dao, address indexed token);

    constructor(
        DAOFactory _fac,
        ENS _ens,
        MiniMeTokenFactory _minimeFac,
        IFIFSResolvingRegistrar _aragonID,
        bytes32[4] _appIds,
        bytes32[4] _planningAppIds,
        StandardBounties _registry
    )
        KitBase(_fac, _ens)
        public
    {
        require(isContract(address(_fac.regFactory())));

        minimeFac = _minimeFac;
        aragonID = _aragonID;
        appIds = _appIds;
        planningAppIds = _planningAppIds;
        registry = _registry;
    }

    function createDAO(
        string aragonId,
        MiniMeToken token
    )
        internal
        returns (
            Kernel dao,
            ACL acl,
            Finance finance,
            Vault vault,
            Allocations allocations,
            RangeVoting rangeVoting,
            Projects projects,
            AddressBook addressBook,
            TokenManager tokenManager,
            Voting voting
        )
    {

        dao = fac.newDAO(this);

        acl = ACL(dao.acl());

        acl.createPermission(this, dao, dao.APP_MANAGER_ROLE(), this);

        voting = Voting(
            dao.newAppInstance(
                appIds[uint8(Apps.Voting)],
                latestVersionAppBase(appIds[uint8(Apps.Voting)])
            )
        );
        emit InstalledApp(voting, appIds[uint8(Apps.Voting)]);

        vault = Vault(
            dao.newAppInstance(
                appIds[uint8(Apps.Vault)],
                latestVersionAppBase(appIds[uint8(Apps.Vault)]),
                new bytes(0),
                true
            )
        );
        emit InstalledApp(vault, appIds[uint8(Apps.Vault)]);

        finance = Finance(
            dao.newAppInstance(
                appIds[uint8(Apps.Finance)],
                latestVersionAppBase(appIds[uint8(Apps.Finance)])
            )
        );
        emit InstalledApp(finance, appIds[uint8(Apps.Finance)]);

        tokenManager = TokenManager(
            dao.newAppInstance(
                appIds[uint8(Apps.TokenManager)],
                latestVersionAppBase(appIds[uint8(Apps.TokenManager)])
            )
        );
        emit InstalledApp(tokenManager, appIds[uint8(Apps.TokenManager)]);
        
        // Planning Apps
        addressBook = AddressBook(
            dao.newAppInstance(
                planningAppIds[uint8(PlanningApps.AddressBook)],
                latestVersionAppBase(planningAppIds[uint8(PlanningApps.AddressBook)])
            )
        );
        emit InstalledApp(addressBook, planningAppIds[uint8(PlanningApps.AddressBook)]);
        
        projects = Projects(
            dao.newAppInstance(
                planningAppIds[uint8(PlanningApps.Projects)],
                latestVersionAppBase(planningAppIds[uint8(PlanningApps.Projects)])
            )
        );
        emit InstalledApp(projects, planningAppIds[uint8(PlanningApps.Projects)]);
        
        rangeVoting = RangeVoting(
            dao.newAppInstance(
                planningAppIds[uint8(PlanningApps.RangeVoting)],
                latestVersionAppBase(planningAppIds[uint8(PlanningApps.RangeVoting)])
            )
        );
        emit InstalledApp(rangeVoting,planningAppIds[uint8(PlanningApps.RangeVoting)]);
        
        allocations = Allocations(
            dao.newAppInstance(
                planningAppIds[uint8(PlanningApps.Allocations)],
                latestVersionAppBase(planningAppIds[uint8(PlanningApps.Allocations)])
            )
        );
        emit InstalledApp(allocations, planningAppIds[uint8(PlanningApps.Allocations)]);

        
        // A1 permissions
        acl.createPermission(tokenManager, voting, voting.CREATE_VOTES_ROLE(), voting);
        acl.createPermission(voting, voting, voting.MODIFY_QUORUM_ROLE(), voting);
        // acl.createPermission(finance, vault, vault.TRANSFER_ROLE(), voting);
        acl.createPermission(voting, finance, finance.CREATE_PAYMENTS_ROLE(), voting);
        acl.createPermission(voting, finance, finance.EXECUTE_PAYMENTS_ROLE(), voting);
        acl.createPermission(voting, finance, finance.MANAGE_PAYMENTS_ROLE(), voting);
        acl.createPermission(voting, tokenManager, tokenManager.ASSIGN_ROLE(), voting);
        acl.createPermission(voting, tokenManager, tokenManager.REVOKE_VESTINGS_ROLE(), voting);

        // AddressBook permissions:
        acl.createPermission(ANY_ENTITY, addressBook, addressBook.ADD_ENTRY_ROLE(), voting);
        acl.createPermission(ANY_ENTITY, addressBook, addressBook.REMOVE_ENTRY_ROLE(), voting);
        // emit InstalledApp(addressBook, addressBookAppId);


        // Projects permissions:
        acl.createPermission(voting, projects, projects.ADD_BOUNTY_ROLE(), voting);
        acl.createPermission(ANY_ENTITY, projects, projects.ADD_REPO_ROLE(), voting);
        acl.createPermission(ANY_ENTITY, projects, projects.CHANGE_SETTINGS_ROLE(), voting);
        acl.createPermission(rangeVoting, projects, projects.CURATE_ISSUES_ROLE(), voting);
        acl.createPermission(ANY_ENTITY, projects, projects.REMOVE_REPO_ROLE(), voting);
        acl.createPermission(ANY_ENTITY, projects, projects.TASK_ASSIGNMENT_ROLE(), voting);
        acl.createPermission(ANY_ENTITY, projects, projects.WORK_REVIEW_ROLE(), voting);
        // emit InstalledApp(projects, apps[2]);

        // Range-voting permissions
        acl.createPermission(ANY_ENTITY, rangeVoting, rangeVoting.CREATE_VOTES_ROLE(), voting);
        acl.createPermission(ANY_ENTITY, rangeVoting, rangeVoting.ADD_CANDIDATES_ROLE(), voting);
        acl.createPermission(ANY_ENTITY, rangeVoting, rangeVoting.MODIFY_PARTICIPATION_ROLE(), voting);
        // emit InstalledApp(rangeVoting, apps[3]);

        // Allocations permissions:
        acl.createPermission(ANY_ENTITY, allocations, allocations.START_PAYOUT_ROLE(), voting);
        acl.createPermission(rangeVoting, allocations, allocations.SET_DISTRIBUTION_ROLE(), voting);
        acl.createPermission(ANY_ENTITY, allocations, allocations.EXECUTE_PAYOUT_ROLE(), voting);
        // emit InstalledApp(allocations, apps[1]);
        
        // Vault permissions
        acl.createPermission(finance, vault, vault.TRANSFER_ROLE(), this);
        acl.grantPermission(projects, vault, vault.TRANSFER_ROLE());
        acl.grantPermission(allocations, vault, vault.TRANSFER_ROLE());
        
        // App inits
        vault.initialize();
        finance.initialize(vault, 30 days);
        
        // address root = msg.sender;
        addressBook.initialize();
        projects.initialize(registry, vault);
        
        // TODO: new projects version:
        // projects.initialize(registry, vault, "autark");
        
        rangeVoting.initialize(addressBook, token, 50 * PCT256, 0, 1 minutes);
        allocations.initialize(addressBook);


        // EVMScriptRegistry permissions
        EVMScriptRegistry reg = EVMScriptRegistry(acl.getEVMScriptRegistry());
        acl.createPermission(voting, reg, reg.REGISTRY_ADD_EXECUTOR_ROLE(), voting);
        acl.createPermission(voting, reg, reg.REGISTRY_MANAGER_ROLE(), voting);

        // clean-up
        cleanupPermission(acl, voting, dao, dao.APP_MANAGER_ROLE());
        
        registerAragonID(aragonId, dao);
        emit DeployInstance(dao, token);

        return (
            dao,
            acl,
            finance,
            vault,
            allocations,
            rangeVoting,
            projects,
            addressBook,
            tokenManager,
            voting
        );
    }

    function cacheToken(MiniMeToken token, address owner) internal {
        tokenCache[owner] = token;
        emit DeployToken(token, owner);
    }

    function popTokenCache(address owner) internal returns (MiniMeToken) {
        require(tokenCache[owner] != address(0));
        MiniMeToken token = MiniMeToken(tokenCache[owner]);
        delete tokenCache[owner];

        return token;
    }

    function registerAragonID(string name, address owner) internal {
        aragonID.register(keccak256(abi.encodePacked(name)), owner);
    }
}