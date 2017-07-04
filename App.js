
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Container, Header, Title, Content, Text,
    Button, Icon, Left, Right, Body, Badge,
    List, ListItem, CheckBox, Segment
} from 'native-base';
import { Animated, View, ListView } from 'react-native';

import styles from './styles/styles';

var taskArray = [];

class App extends React.Component {
    constructor(props) {
        super(props);

        var dataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.Id != r2.Id });
        this.state = {
            tasks: taskArray,
            dataSource: dataSource.cloneWithRows(taskArray),
            isLoading: true,
            editMode: false,
            controlHeight: new Animated.Value(0),
            controlOpacity: new Animated.Value(0),
            controlWidth: new Animated.Value(0)
        }
    }

    componentDidMount() {
        this.getTaskList();
    }

    findTaskIndex(taskId) {
        let { tasks } = this.state;
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].Id === taskId) {
                return i;
            }
        }

        return -1;
    }

    async getTaskList() {
        try {
          this.getTheData(function (json) {
              taskArray = json.Tasks;
              this.setState({
                  tasks: taskArray,
                  dataSource: this.state.dataSource.cloneWithRows(taskArray),
                  isLoading: false
              })
          }.bind(this));
            
        } catch (error) {
            console.log("There was an error getting the tasks");
        }
    }

    getTheData(callback) {
        var url = "http://localhost:8086/ws2/projects/taskssample";
        fetch(url).then(response => response.json())
            .then(json => callback(json))
            .catch(error => console.log(error));
    }

    toggleEditMode() {
        if (!this.state.editMode) {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(this.state.controlOpacity, { toValue: 1, duration: 300 }),
                    Animated.timing(this.state.controlHeight, { toValue: 40, duration: 300}),
                    Animated.timing(this.state.controlWidth, { toValue: 20, duration: 300})
                ])
            ]).start();
        } else {
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(this.state.controlOpacity, { toValue: 0, duration: 300 }),
                    Animated.timing(this.state.controlHeight, { toValue: 0, duration: 300}),
                    Animated.timing(this.state.controlWidth, { toValue: 0, duration: 300})
                ])
            ]).start();
        }

        this.setState({
            editMode: !this.state.editMode
        });
    }

    findTaskIndex(taskId) {
        let { tasks } = this.state;
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].Id == taskId) {
                return i;
            }
        }

        return -1;
    }

    toggleCheckForTask(taskId) {
        var foundIndex = this.findTaskIndex(taskId);

        // the ischecked value will be set for that task in the tasks array
        var newTasks = this.state.tasks;
        newTasks[foundIndex].isChecked = !newTasks[foundIndex].isChecked;

        // the list is updated with the new task array
        var newDataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1.Id != r2.Id });

        this.setState({
            tasks: newTasks,
            dataSource: newDataSource.cloneWithRows(newTasks)
        });

        console.log('Index of this task is ', foundIndex);
    }

    renderRow(rowData, sectionId, rowId) {
        return (
            <ListItem>
                <Animated.View style={{opacity: this.state.controlOpacity, 
                    width: this.state.controlWidth}}>
                    <CheckBox checked={rowData.isChecked} onPress={() => this.toggleCheckForTask(rowData.Id)} />
                </Animated.View>
                <Body>
                    <Text>{rowData.Description}</Text>
                    <View>
                        <Text style={styles.taskDate}>{rowData.CreatedOn}</Text>
                    </View>
                </Body>

                <Right>
                    <Text style={styles.taskEffort}>{rowData.Effort}</Text>
                </Right>
            </ListItem>
        );
    }

    render() {
        let currentView = <View />;
        if (this.state.isLoading) {
            currentView = <View />;
        } else {
            currentView = <ListView style={styles.taskListView}
                dataSource={this.state.dataSource} renderRow={this.renderRow.bind(this)}
                enableEmptySections={true}
            />;
        }

        return (
            <Container style={styles.container}>
                <Header>
                    <Left>
                        </Left>
                    <Body>
                        <Title>My tasks</Title>
                    </Body>
                    <Right>
                        <Button onPress={() => this.toggleEditMode()} transparent><Text>Edit</Text></Button>
                    </Right>
                </Header>
                <Animated.View style={{...styles.controlStyles, opacity: this.state.controlOpacity, 
                height: this.state.controlHeight}}>
                    <Button small transparent><Text>Delete</Text></Button>
                </Animated.View>
                <Content>
                    {currentView}
                </Content>
            </Container>
        );
    }
}


export default App;
