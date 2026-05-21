const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLID,
} = require("graphql");

const Project = require("../models/project");
const Skill = require("../models/Skills");
const About = require("../models/about");

// ====================== TYPES ======================
const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    projectImg: { type: GraphQLString },
    publicId: { type: GraphQLString },
    projectsUrl: { type: GraphQLString },
    projectCodeViewurl: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

const SkillType = new GraphQLObjectType({
  name: "Skill",
  fields: () => ({
    id: { type: GraphQLID },
    skillName: { type: GraphQLString },
    description: { type: GraphQLString },
    projectImg: { type: GraphQLString },
    publicId: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

const AboutType = new GraphQLObjectType({
  name: "About",
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

// ====================== INPUT TYPES ======================
const ProjectInputType = new GraphQLInputObjectType({
  name: "ProjectInput",
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    projectsUrl: { type: new GraphQLNonNull(GraphQLString) },
    projectCodeViewurl: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const SkillInputType = new GraphQLInputObjectType({
  name: "SkillInput",
  fields: () => ({
    skillName: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const AboutInputType = new GraphQLInputObjectType({
  name: "AboutInput",
  fields: () => ({
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

// ====================== ROOT QUERY ======================
const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    projects: {
      type: new GraphQLList(ProjectType),
      args: { search: { type: GraphQLString } },
      resolve: async (parent, args) => {
        try {
          const query = args.search
            ? {
                $or: [
                  { name: { $regex: args.search, $options: "i" } },
                  { title: { $regex: args.search, $options: "i" } },
                ],
              }
            : {};
          return await Project.find(query).sort({ createdAt: -1 });
        } catch (error) {
          console.error("Error fetching projects:", error);
          throw new Error("Failed to fetch projects");
        }
      },
    },
    project: {
      type: ProjectType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args) => {
        try {
          return await Project.findById(args.id);
        } catch (error) {
          throw new Error("Project not found");
        }
      },
    },
    skills: {
      type: new GraphQLList(SkillType),
      resolve: async () => {
        try {
          return await Skill.find().sort({ createdAt: -1 });
        } catch (error) {
          console.error("Error fetching skills:", error);
          throw new Error("Failed to fetch skills");
        }
      },
    },
    skill: {
      type: SkillType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args) => {
        try {
          return await Skill.findById(args.id);
        } catch (error) {
          throw new Error("Skill not found");
        }
      },
    },
    abouts: {
      type: new GraphQLList(AboutType),
      resolve: async () => {
        try {
          return await About.find().sort({ createdAt: -1 });
        } catch (error) {
          console.error("Error fetching abouts:", error);
          throw new Error("Failed to fetch abouts");
        }
      },
    },
    about: {
      type: AboutType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args) => {
        try {
          return await About.findById(args.id);
        } catch (error) {
          throw new Error("About not found");
        }
      },
    },
  },
});

// ====================== MUTATIONS ======================
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createProject: {
      type: ProjectType,
      args: { input: { type: new GraphQLNonNull(ProjectInputType) } },
      resolve: async (parent, args) => {
        try {
          const newProject = new Project(args.input);
          return await newProject.save();
        } catch (error) {
          console.error("Error creating project:", error);
          throw new Error(`Failed to create project: ${error.message}`);
        }
      },
    },
    updateProject: {
      type: ProjectType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(ProjectInputType) },
      },
      resolve: async (parent, args) => {
        try {
          return await Project.findByIdAndUpdate(args.id, args.input, {
            new: true,
          });
        } catch (error) {
          throw new Error(`Failed to update project: ${error.message}`);
        }
      },
    },
    deleteProject: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args) => {
        try {
          await Project.findByIdAndDelete(args.id);
          return "Project deleted successfully";
        } catch (error) {
          throw new Error(`Failed to delete project: ${error.message}`);
        }
      },
    },
    createSkill: {
      type: SkillType,
      args: { input: { type: new GraphQLNonNull(SkillInputType) } },
      resolve: async (parent, args) => {
        try {
          const newSkill = new Skill(args.input);
          return await newSkill.save();
        } catch (error) {
          throw new Error(`Failed to create skill: ${error.message}`);
        }
      },
    },
    updateSkill: {
      type: SkillType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(SkillInputType) },
      },
      resolve: async (parent, args) => {
        try {
          return await Skill.findByIdAndUpdate(args.id, args.input, {
            new: true,
          });
        } catch (error) {
          throw new Error(`Failed to update skill: ${error.message}`);
        }
      },
    },
    deleteSkill: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args) => {
        try {
          await Skill.findByIdAndDelete(args.id);
          return "Skill deleted successfully";
        } catch (error) {
          throw new Error(`Failed to delete skill: ${error.message}`);
        }
      },
    },
    createAbout: {
      type: AboutType,
      args: { input: { type: new GraphQLNonNull(AboutInputType) } },
      resolve: async (parent, args) => {
        try {
          const newAbout = new About(args.input);
          return await newAbout.save();
        } catch (error) {
          throw new Error(`Failed to create about: ${error.message}`);
        }
      },
    },
    updateAbout: {
      type: AboutType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(AboutInputType) },
      },
      resolve: async (parent, args) => {
        try {
          return await About.findByIdAndUpdate(args.id, args.input, {
            new: true,
          });
        } catch (error) {
          throw new Error(`Failed to update about: ${error.message}`);
        }
      },
    },
    deleteAbout: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (parent, args) => {
        try {
          await About.findByIdAndDelete(args.id);
          return "About deleted successfully";
        } catch (error) {
          throw new Error(`Failed to delete about: ${error.message}`);
        }
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
