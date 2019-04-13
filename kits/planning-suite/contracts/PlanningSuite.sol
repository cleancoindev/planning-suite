pragma solidity 0.4.24;

import "./BetaKitBase.sol";


contract PlanningSuite is BetaKitBase {
    constructor(
        DAOFactory _fac,
        ENS _ens,
        MiniMeTokenFactory _minimeFac,
        IFIFSResolvingRegistrar _aragonID,
        bytes32[4] _appIds,
        bytes32[4] _planningAppIds,
        StandardBounties _registry
    )
        BetaKitBase(_fac, _ens, _minimeFac, _aragonID, _appIds, _planningAppIds, _registry)
        public
    {
        // solium-disable-previous-line no-empty-blocks
    }

    function newTokenAndInstance(
        string tokenName,
        string tokenSymbol,
        string aragonId,
        address[] holders,
        uint256[] tokens,
        uint64 supportNeeded,
        uint64 minAcceptanceQuorum,
        uint64 voteDuration
    ) public
    {
        newToken(tokenName, tokenSymbol);
        newInstance(
            aragonId,
            holders,
            tokens,
            supportNeeded,
            minAcceptanceQuorum,
            voteDuration
        );
    }

    function newToken(string tokenName, string tokenSymbol) public returns (MiniMeToken token) {
        token = minimeFac.createCloneToken(
            MiniMeToken(address(0)),
            0,
            tokenName,
            18,
            tokenSymbol,
            true
        );
        cacheToken(token, msg.sender);
    }

    function newInstance(
        string aragonId,
        address[] holders,
        uint256[] tokens,
        uint64 supportNeeded,
        uint64 minAcceptanceQuorum,
        uint64 voteDuration
    )
        public
    {
        require(voteDuration > 0); // TODO: remove it once we add it to Voting app
        require(holders.length == tokens.length);

        MiniMeToken token = popTokenCache(msg.sender);
        Kernel dao;
        ACL acl;
        Voting voting;
        TokenManager tokenManager;
        // RangeVoting  rangeVoting;
        

        (dao, acl, , , , , , , tokenManager, voting) = createDAO(
            aragonId,
            token
        );

        // Required for initializing the Token Manager
        token.changeController(tokenManager);
        tokenManager.initialize(token, uint256(-1) > 1, uint256(-1));

        // Set up the token stakes
        acl.createPermission(this, tokenManager, tokenManager.MINT_ROLE(), this);

        for (uint256 i = 0; i < holders.length; i++) {
            tokenManager.mint(holders[i], tokens[i]);
        }

        voting.initialize(
            token,
            supportNeeded,
            minAcceptanceQuorum,
            voteDuration
        );

        // burn support modification permission
        acl.createBurnedPermission(voting, voting.MODIFY_SUPPORT_ROLE());

        cleanupPermission(acl, voting, acl, acl.CREATE_PERMISSIONS_ROLE());

        cleanupPermission(acl, voting, tokenManager, tokenManager.MINT_ROLE());
    }
}