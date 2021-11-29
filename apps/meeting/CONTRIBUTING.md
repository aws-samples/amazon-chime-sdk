# Contributing Guidelines

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional
documentation, we greatly value feedback and contributions from our community.

Please read through this document before submitting any issues or pull requests to ensure we have all the necessary
information to effectively respond to your bug report or contribution.


## Reporting Bugs/Feature Requests

We welcome you to use the GitHub issue tracker to report bugs or suggest features.

When filing an issue, please check existing open or recently closed issues to make sure somebody else has not already
reported the issue. Please try to include as much information as you can. Details like these are incredibly useful:

* A reproducible test case or series of steps
* The version of our code being used
* Any modifications you've made relevant to the bug
* Anything unusual about your environment or deployment


## Contributing via Pull Requests
Contributions via pull requests are much appreciated. Before sending us a pull request, please ensure that:

1. Fork the repository and make sure you are working against the latest source on the *meeting-dev* branch. We use *meeting-dev* branch for `apps/meeting` app to contribute all PRs. This app is used to test the changes releasing into the next [amazon-chime-sdk-component-library-react](https://github.com/aws/amazon-chime-sdk-component-library-react) release.
2. Run the meeting demo locally first. The *meeting-dev* apps/meeting demo changes are unstable and contributors will need to create and install the `amazon-chime-sdk-component-library-react` tarball from its *master* branch to start the demo.

    1. In a different directory, create `amazon-chime-sdk-component-library-react` tarball.
    ```
    git clone https://github.com/aws/amazon-chime-sdk-component-library-react &&
    cd amazon-chime-sdk-component-library-react &&
    npm install &&
    npm run build &&
    npm pack
    ```
    This will create a tarball named: `amazon-chime-sdk-component-library-react-<latest-released-npm-version>.tgz`

    2. Install the tarball in the meeting app
    ```
    cd <meeting-dev branch checked out from the aws-samples/amazon-chime-sdk cloned repository>
    cd apps/meeting
    npm install
    npm install <path-to-amazon-chime-sdk-component-library-react-tarball>
    ```

    3. Start the app:
    ```
    npm run start
    ```
    
    4. Open the app using https://0.0.0.0:9000/ in a browser.

3. Modify source and ensure local demo app testing works as expected.
4. Commit to your fork using clear commit messages.
5. Send us a pull request, answering any default questions in the pull request interface.
6. The PR should open against the *meeting-dev* branch and not the *main* branch.
> Note that *meeting-dev* branch is for testing the next release, hence contributor must create PR against the meeting-dev branch.
The *main* branch is a stable demo branch for the last release and any changes after a release must go into the *meeting-dev* branch.

7. When opening PR, exclude any `package.json` changes for `the amazon-chime-sdk-component-library-react` dependency.

GitHub provides additional document on [forking a repository](https://help.github.com/articles/fork-a-repo/) and
[creating a pull request](https://help.github.com/articles/creating-a-pull-request/).


## Finding contributions to work on
Looking at the existing issues is a great way to find something to contribute on. As our projects, by default, use the default GitHub issue labels (enhancement/bug/duplicate/help wanted/invalid/question/wontfix), looking at any 'help wanted' issues is a great place to start.


## Code of Conduct
This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct).
For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact
opensource-codeofconduct@amazon.com with any additional questions or comments.


## Security issue notifications
If you discover a potential security issue in this project please notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public github issue.


## Licensing

See the [LICENSE](LICENSE) file for our project's licensing. We will ask you to confirm the licensing of your contribution.
