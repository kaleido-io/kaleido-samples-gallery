# OpenLaw / Kaleido API Integration Demonstration

This project demonstrates how one might integrate a private blockchain consortium based on [Kaleido](https://kaleido.io) and [OpenLaw](https://openlaw.io).  Combining the OpenLaw API with Kaleido private blockchain networks makes it possible to build powerful, legally enforceable agreements among consortium participants.

## About the Demo Consortium

This demonstration envisions a fictitious consortium of agricultural organizations--possibly suppliers, farmers, land owners, regulators, and others.

Any number of possible interactions are possible on the network.  Participants could buy and sell produce.  They could trace the provenance of supplies.  They may track the movement of inventory using internet of things ("IoT") devices and store evidence on the private blockchain.  Anything is possible.

In this demonstration, we demonstrate how two participants in the consortium could enter into a joint venture ("JV") project where evidence and performance of the project could be stored on the private, Kaleido-based blockchain network.

![Screen Shot - 1 ](readme-imgs/screen-1.png)

The first screen, pictured above, is the first of a few steps for joint venture participants to set up a new project among themselves.

![Screen Shot - 2 ](readme-imgs/screen-2.png)

After entering the data, the participants will get a preview screen, depicted above, of the non-disclosure agreement.  This was the result of an API call from the joint venture distributed application through the OpenLaw API to retrieve the preview.

![Screen Shot - 3 ](readme-imgs/screen-3.png)

Once the user is ready to begin the signature process on OpenLaw, they will receive modal notification rendered above.

![Screen Shot - 4 ](readme-imgs/screen-4.png)

Finally, after clicking the modal button, users will be redirected to OpenLaw where they can complete the signature process.

For now, that is the end of the demonstration.  The other steps in the process have not been built out, but hopefully we have captured your imagination for how to combine the OpenLaw API with Kaleido private networks to build powerful, legally enforceable agreements among consortium participants.


## Configuration

The demonstration works best under these circumstances:
* you first create two user accounts to mimic the joint venture participants and keep track of their passwords, and
* you log into the OpenLaw website with one of those users for the joint venture.


## For More

* **Kaleido** Visit Kaleido [here](https://kaleido.io)
* **OpenLaw** Visit OpenLaw [here](https://openlaw.io)
* To learn more about documenting legally binding, blockchain-enabled contracts, visit [docs.openlaw.io](https://docs.openlaw.io)
